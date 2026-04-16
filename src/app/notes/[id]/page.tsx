"use client";
import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { AIPanel } from "@/components/ai/AIPanel";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import type { Note } from "@/types";

export default function NoteDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = React.useState<Note | null>(null);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/notes/${id}`);
        const data = await res.json();
        if (data.success) {
          setNote(data.data);
          setTitle(data.data.title);
          setContent(data.data.content);
          setTags(data.data.tags ?? []);
        } else {
          toast.error("Note not found");
          router.push("/dashboard");
        }
      } catch {
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id, router]);

  const handleTitleChange = (v: string) => { setTitle(v); setDirty(true); };
  const handleContentChange = (v: string) => { setContent(v); setDirty(true); };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      });
      const data = await res.json();
      if (data.success) { setNote(data.data); setDirty(false); toast.success("Note saved!"); }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      toast.success("Note deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 space-y-4">
          {/* updated for responsiveness */}
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* updated for responsiveness */}

      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm shrink-0">
          {/* updated for responsiveness */}

          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />Dashboard
          </Button>

          <div className="flex items-center gap-2">
            {note && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Saved {formatRelativeTime(note.updatedAt)}
              </span>
            )}
            {dirty && (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save changes"}
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* 🔥 KEY FIX */}

          {/* EDITOR */}
          <div className="w-full flex-1 p-4 md:p-8 md:max-w-3xl">
            {/* updated for responsiveness */}

            <NoteEditor
              title={title}
              content={content}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
            />

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-6 pt-6 border-t">
                {tags.map((tag) => <span key={tag} className="tag-pill">{tag}</span>)}
              </div>
            )}
          </div>

          {/* AI PANEL */}
          <aside className="w-full md:w-72 border-t md:border-t-0 md:border-l p-4">
            {/* updated for responsiveness */}

            <AIPanel
              noteId={id}
              title={title}
              content={content}
              onImproveApply={(improved) => { handleContentChange(improved); }}
              onSummaryUpdate={(summary) => setNote((n) => n ? { ...n, summary } : n)}
              onTagsUpdate={(newTags) => { setTags(newTags); setDirty(true); }}
            />
          </aside>

        </div>
      </main>
    </div>
  );
}