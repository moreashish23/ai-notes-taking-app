"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  title: string;
  content: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  className?: string;
}

export function NoteEditor({ title, content, onTitleChange, onContentChange, className }: NoteEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Note title…"
        className="text-xl font-semibold border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
      />
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Start writing your note…"
        className="border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 text-sm leading-relaxed min-h-[400px] resize-none"
      />
    </div>
  );
}