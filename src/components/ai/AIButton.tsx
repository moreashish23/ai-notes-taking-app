"use client";
import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AIButton({ label, onClick, loading, disabled, className }: AIButtonProps) {
  return (
    <Button
      variant="ai"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn("gap-1.5", className)}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {loading ? "Working…" : label}
    </Button>
  );
}