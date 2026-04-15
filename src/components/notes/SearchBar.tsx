"use client";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search notes…" className="pl-9 pr-8" />
      {value && (
        <Button variant="ghost" size="icon-sm" onClick={() => onChange("")} className="absolute right-1 h-7 w-7 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}