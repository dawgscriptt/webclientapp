"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";

export function HubHeader({ lang, name }: { lang: string; name?: string }) {
  return (
    <div className="rounded border p-3 flex items-center justify-between">
      <div className="space-y-1">
        <div className="text-lg font-semibold">{name ?? lang}</div>
        <div className="flex gap-2">
          <Badge>hub</Badge>
          <Badge>{lang}</Badge>
        </div>
      </div>
      <div className="flex gap-3 text-sm">
        <Link className="underline" href={`/learn/${lang}/reading`}>Reading</Link>
        <Link className="underline" href={`/learn/${lang}/listening`}>Listening</Link>
      </div>
    </div>
  );
}
