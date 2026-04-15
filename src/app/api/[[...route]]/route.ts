import { Hono } from "hono";
import { handle } from "hono/vercel";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, ilike, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { summarizeNote, improveNote, generateTags } from "@/lib/ai";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// Auth helper 
async function getUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

// Delegate auth routes to Better Auth 
app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

//  Schemas 
const createNoteSchema = z.object({
  title: z.string().min(1, "Title required").max(255),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().nullable().optional(),
  isPinned: z.boolean().optional(),
});

const searchSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const aiSchema = z.object({
  noteId: z.string().uuid(),
  content: z.string().min(1),
  title: z.string().optional(),
});

//  GET /api/notes 
app.get("/notes", zValidator("query", searchSchema), async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { q, limit, offset } = c.req.valid("query");

  try {
    const conditions = [eq(notes.userId, user.id)];
    if (q?.trim()) {
      conditions.push(or(ilike(notes.title, `%${q}%`), ilike(notes.content, `%${q}%`))!);
    }

    const result = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt))
      .limit(limit)
      .offset(offset);

    return c.json({ success: true, data: result });
  } catch {
    return c.json({ error: "Failed to fetch notes" }, 500);
  }
});

//  GET /api/notes/:id 
app.get("/notes/:id", async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { id } = c.req.param();
  try {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!note) return c.json({ error: "Note not found" }, 404);
    return c.json({ success: true, data: note });
  } catch {
    return c.json({ error: "Failed to fetch note" }, 500);
  }
});

//  POST /api/notes 
app.post("/notes", zValidator("json", createNoteSchema), async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const data = c.req.valid("json");
  try {
    const [note] = await db
      .insert(notes)
      .values({ title: data.title, content: data.content, tags: data.tags, userId: user.id })
      .returning();

    return c.json({ success: true, data: note }, 201);
  } catch {
    return c.json({ error: "Failed to create note" }, 500);
  }
});

//  PATCH /api/notes/:id 
app.patch("/notes/:id", zValidator("json", updateNoteSchema), async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { id } = c.req.param();
  const data = c.req.valid("json");

  try {
    const [existing] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existing) return c.json({ error: "Note not found" }, 404);

    const [updated] = await db
      .update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
      .returning();

    return c.json({ success: true, data: updated });
  } catch {
    return c.json({ error: "Failed to update note" }, 500);
  }
});

//  DELETE /api/notes/:id 
app.delete("/notes/:id", async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { id } = c.req.param();
  try {
    const [existing] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existing) return c.json({ error: "Note not found" }, 404);

    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
    return c.json({ success: true, message: "Note deleted" });
  } catch {
    return c.json({ error: "Failed to delete note" }, 500);
  }
});

//  POST /api/ai/summarize 
app.post("/ai/summarize", zValidator("json", aiSchema), async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { noteId, content } = c.req.valid("json");
  const result = await summarizeNote(content);
  if (!result.success) return c.json({ error: result.error }, 422);

  await db
    .update(notes)
    .set({ summary: result.data as string, updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));

  return c.json({ success: true, data: result.data });
});

// ── POST /api/ai/improve ───────────────────────────────────
app.post("/ai/improve", zValidator("json", aiSchema), async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { content } = c.req.valid("json");
  const result = await improveNote(content);
  if (!result.success) return c.json({ error: result.error }, 422);

  return c.json({ success: true, data: result.data });
});

// POST /api/ai/tags
app.post("/ai/tags", zValidator("json", aiSchema), async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { noteId, content, title } = c.req.valid("json");
  const result = await generateTags(title ?? "", content);
  if (!result.success) return c.json({ error: result.error }, 422);

  await db
    .update(notes)
    .set({ tags: result.data as string[], updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));

  return c.json({ success: true, data: result.data });
});

//  Health check 
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);