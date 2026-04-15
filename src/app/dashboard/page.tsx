"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Pin } from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { NoteCard } from "@/components/notes/NoteCard";
import { SearchBar } from "@/components/notes/SearchBar";
import { NotesSkeleton } from "@/components/notes/NotesSkeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Note } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isPending && !session) router.push("/auth/login");
  }, [session, isPending, router]);

  // Fetch notes
  const fetchNotes = React.useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `/api/notes?q=${encodeURIComponent(q)}` : "/api/notes";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session) fetchNotes();
  }, [session, fetchNotes]);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (session) fetchNotes(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, session, fetchNotes]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        toast.success("Note deleted");
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.map((n) => n.id === id ? { ...n, isPinned } : n));
        toast.success(isPinned ? "Note pinned" : "Note unpinned");
      }
    } catch {
      toast.error("Failed to update note");
    }
  };

  const pinned = notes.filter((n) => n.isPinned);
  const unpinned = notes.filter((n) => !n.isPinned);

  if (isPending) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b bg-background/80 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-lg font-semibold">My Notes</h1>
            <p className="text-xs text-muted-foreground">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar value={search} onChange={setSearch} className="w-64" />
            <Button size="sm" onClick={() => router.push("/notes/new")}>
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {loading ? (
            <NotesSkeleton />
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center page-enter">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{search ? "No notes found" : "No notes yet"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? `No results for "${search}"` : "Create your first note to get started"}
                </p>
              </div>
              {!search && (
                <Button onClick={() => router.push("/notes/new")}>
                  <Plus className="h-4 w-4" />
                  Create first note
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6 page-enter">
              {pinned.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Pin className="h-3.5 w-3.5 text-amber-500" />
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pinned</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pinned.map((note) => (
                      <NoteCard key={note.id} note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                    ))}
                  </div>
                </section>
              )}

              {unpinned.length > 0 && (
                <section>
                  {pinned.length > 0 && (
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">All Notes</h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unpinned.map((note) => (
                      <NoteCard key={note.id} note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}