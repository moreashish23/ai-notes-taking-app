"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, generateAvatarColor, formatRelativeTime } from "@/lib/utils";
import { Mail, Calendar, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.push("/auth/login");
  }, [session, isPending, router]);

  React.useEffect(() => {
    if (!session) return;
    fetch("/api/notes?limit=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotes(d.data); })
      .finally(() => setLoadingNotes(false));
  }, [session]);

  if (isPending) return null;
  const user = session?.user;
  if (!user) return null;

  const initials = getInitials(user.name);
  const avatarBg = generateAvatarColor(user.name);
  const notesWithSummary = notes.filter((n) => n.summary);
  const notesWithTags = notes.filter((n) => n.tags.length > 0);
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const allTags = [...new Set(notes.flatMap((n) => n.tags))];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto p-8 space-y-6 page-enter">
          <h1 className="text-2xl font-semibold">Profile</h1>

          {/* User card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback className={cn("text-lg text-white font-semibold", avatarBg)}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Total notes", value: notes.length, icon: FileText },
                  { label: "Pinned", value: pinnedNotes.length, icon: FileText },
                  { label: "AI summaries", value: notesWithSummary.length, icon: Sparkles },
                  { label: "Unique tags", value: allTags.length, icon: FileText },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center p-3 rounded-lg bg-muted/40">
                    {loadingNotes ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-amber-500">{value}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags cloud */}
          {allTags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Tags</CardTitle>
                <CardDescription>All tags across your notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Notes</CardTitle>
              <CardDescription>Your last 5 notes</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingNotes ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {notes.slice(0, 5).map((note) => (
                    <button
                      key={note.id}
                      onClick={() => router.push(`/notes/${note.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(note.updatedAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        {note.summary && <Badge variant="amber" className="text-xs py-0">AI</Badge>}
                        {note.isPinned && <Badge variant="amber" className="text-xs py-0">Pinned</Badge>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}