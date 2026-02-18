"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none min-h-[120px]",
        "focus:ring-2 focus:ring-[hsl(var(--brand)/.35)]",
        className
      )}
      {...rest}
    />
  );
}
