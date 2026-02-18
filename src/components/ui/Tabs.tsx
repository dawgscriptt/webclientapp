"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm border border-border transition",
              active
                ? "bg-[hsl(var(--brand)/.14)] border-[hsl(var(--brand)/.30)] text-fg"
                : "bg-card text-mutedFg hover:bg-muted hover:text-fg"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
