"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { AIPanel } from "@/components/ai/AIPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(null);

  const saveDraft = React.useCallback(async () => {
    if (!title.trim() || savedId) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Untitled", content, tags }),
      });
      const data = await res.json();
      if (data.success) setSavedId(data.data.id);
    } catch {}
  }, [title, content, tags, savedId]);

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Please add a title"); return; }
    setSaving(true);
    try {
      if (savedId) {
        await fetch(`/api/notes/${savedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tags }),
        });
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tags }),
        });
        const data = await res.json();
        if (data.success) setSavedId(data.data.id);
      }
      toast.success("Note saved!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleTitleBlur = () => { if (title && !savedId) saveDraft(); };

  const effectiveId = savedId ?? "new";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* KEEP ORIGINAL — DO NOT CHANGE */}

      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* KEEP ORIGINAL */}

        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />Back
          </Button>

          <div className="flex items-center gap-2">
            {tags.length > 0 && (
              <div className="hidden sm:flex gap-1">
                {tags.slice(0, 3).map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            )}

            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </header>

        {/* ONLY CHANGE HERE */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* updated for responsiveness */}

          {/* Editor */}
          <div className="flex-1 p-4 md:p-8 max-w-full md:max-w-3xl">
            {/* updated for responsiveness */}

            <NoteEditor
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onTitleBlur={handleTitleBlur}
            />
          </div>

          {/* AI Panel */}
          <aside className="w-full md:w-72 border-t md:border-t-0 md:border-l p-4">
            {/* updated for responsiveness */}

            <AIPanel
              noteId={effectiveId}
              title={title}
              content={content}
              onImproveApply={setContent}
              onSummaryUpdate={() => {}}
              onTagsUpdate={setTags}
            />
          </aside>

        </div>
      </main>
    </div>
  );
}