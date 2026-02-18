"use client";

import { cn } from "@/lib/utils";

export function Avatar({
  name,
  url,
  className,
}: {
  name: string;
  url?: string | null;
  className?: string;
}) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-mutedFg">{initials}</span>
      )}
    </div>
  );
}
