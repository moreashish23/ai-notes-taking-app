"use client";
import * as React from "react";
import { Sparkles, X, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIButton } from "./AIButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AIPanelProps {
  noteId: string;
  title: string;
  content: string;
  onImproveApply: (improved: string) => void;
  onSummaryUpdate: (summary: string) => void;
  onTagsUpdate: (tags: string[]) => void;
  className?: string;
}

type LoadingState = "summarize" | "improve" | "tags" | null;

export function AIPanel({ noteId, title, content, onImproveApply, onSummaryUpdate, onTagsUpdate, className }: AIPanelProps) {
  const [loading, setLoading] = React.useState<LoadingState>(null);
  const [summary, setSummary] = React.useState<string>("");
  const [improvedContent, setImprovedContent] = React.useState<string>("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);

  const callAI = async (action: LoadingState) => {
    if (!content.trim() && action !== "tags") {
      toast.error("Add some content to your note first");
      return;
    }
    setLoading(action);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, content, title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");

      if (action === "summarize") {
        setSummary(data.data);
        onSummaryUpdate(data.data);
        toast.success("Summary generated!");
      } else if (action === "improve") {
        setImprovedContent(data.data);
        toast.success("Improvements ready — review below");
      } else if (action === "tags") {
        setTags(data.data);
        onTagsUpdate(data.data);
        toast.success("Tags generated!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(improvedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-amber-50/50 dark:bg-amber-900/10">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="font-medium text-sm">AI Features</span>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-2">
          <AIButton label="Summarize" onClick={() => callAI("summarize")} loading={loading === "summarize"} disabled={!!loading} />
          <AIButton label="Improve Writing" onClick={() => callAI("improve")} loading={loading === "improve"} disabled={!!loading} />
          <AIButton label="Generate Tags" onClick={() => callAI("tags")} loading={loading === "tags"} disabled={!!loading} />
        </div>

        {/* Summary result */}
        {summary && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1.5">Summary</p>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Improved content result */}
        {improvedContent && (
          <div className="rounded-lg bg-muted/50 border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Improved version</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => setImprovedContent("")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs leading-relaxed line-clamp-6">{improvedContent}</p>
            <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => { onImproveApply(improvedContent); setImprovedContent(""); toast.success("Content updated!"); }}>
              Apply to note
            </Button>
          </div>
        )}

        {/* Tags result */}
        {tags.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Generated tags</p>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}