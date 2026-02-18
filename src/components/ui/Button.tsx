"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "solid",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-3 py-2 text-sm" : "px-3.5 py-2.5 text-sm";
  const styles =
    variant === "solid"
      ? "bg-brand text-brandFg hover:opacity-90"
      : variant === "outline"
      ? "border border-border bg-transparent hover:bg-muted"
      : variant === "danger"
      ? "bg-danger text-dangerFg hover:opacity-90"
      : "bg-transparent hover:bg-muted";

  return <button className={cn(base, sizes, styles, className)} {...props} />;
}
