"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  suggestions?: string[];
}

export function TagInput({ label, value, onChange, placeholder, hint, suggestions = [] }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tags = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !value.includes(t));
    if (tags.length) onChange([...value, ...tags]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const available = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5 [--outer-padding:0.375rem] [--outer-radius:var(--radius-lg)] shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        {value.map((tag) => (
          <span key={tag} className="rounded-inner inline-flex items-center gap-1 bg-accent py-0.5 pl-2 pr-1 text-xs font-medium text-accent-foreground">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded p-0.5 hover:bg-primary/10"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn("rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary")}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
