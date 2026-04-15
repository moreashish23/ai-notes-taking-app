"use client";
import * as React from "react";
import Link from "next/link";
import { Pin, PinOff, Trash2, MoreHorizontal, Sparkles } from "lucide-react";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export function NoteCard({ note, onDelete, onTogglePin }: NoteCardProps) {
  const preview = note.content ? truncate(note.content.replace(/\n+/g, " "), 120) : "No content yet…";

  return (
    <div className={cn(
      "group relative flex flex-col rounded-xl border bg-card shadow-sm transition-all duration-200",
      "hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/40",
      note.isPinned && "border-amber-300 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-900/5"
    )}>
      {note.isPinned && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-xl" />}

      <Link href={`/notes/${note.id}`} className="flex-1 p-4 pb-2">
        <h3 className="font-semibold text-sm leading-snug line-clamp-1 mb-1.5">{note.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-2">{preview}</p>

        {note.summary && (
          <div className="flex items-start gap-1.5 mb-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <Sparkles className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 line-clamp-2">{note.summary}</p>
          </div>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
            {note.tags.length > 3 && <span className="tag-pill opacity-60">+{note.tags.length - 3}</span>}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between px-4 py-2.5 border-t">
        <span className="text-xs text-muted-foreground">{formatRelativeTime(note.updatedAt)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost" size="icon-sm"
            onClick={(e) => { e.preventDefault(); onTogglePin(note.id, !note.isPinned); }}
            className={cn("h-7 w-7", note.isPinned ? "text-amber-500" : "text-muted-foreground")}
          >
            {note.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </Button>

          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground" onClick={(e) => e.preventDefault()}>
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(note.id, !note.isPinned); }}>
                  {note.isPinned ? <><PinOff className="h-4 w-4" />Unpin</> : <><Pin className="h-4 w-4" />Pin</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="h-4 w-4" />Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete note?</AlertDialogTitle>
                <AlertDialogDescription>"{note.title}" will be permanently deleted.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDelete(note.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}