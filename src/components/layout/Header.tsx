"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[hsl(var(--card))]">
      <div className="mx-auto max-w-[1100px] px-3 py-2 flex items-center gap-3">
        <Link href="/" className="font-extrabold tracking-tight">
          LanguageSocial
        </Link>

        <div className="flex-1">
          <input className="input" placeholder="Search posts, users, hubs…" />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link className="rounded-xl border border-border px-3 py-2 hover:bg-[hsl(var(--muted))]" href="/feed">Feed</Link>
          <Link className="rounded-xl border border-border px-3 py-2 hover:bg-[hsl(var(--muted))]" href="/notifications">Notif</Link>
          <Link className="rounded-xl border border-border px-3 py-2 hover:bg-[hsl(var(--muted))]" href="/messages">DM</Link>
        </div>
      </div>
    </header>
  );
}
