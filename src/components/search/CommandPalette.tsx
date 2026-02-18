"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type SearchResult = {
  q: string;
  hubs: Array<{ id: string; langCode: string; name: string }>;
  users: Array<{ id: string; username: string; displayName: string; verified: boolean; accountType: "user" | "bot" }>;
  posts: Array<any>;
};

async function fetchSearch(q: string): Promise<SearchResult> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`, { credentials: "include" });
  const json = await res.json();
  return json;
}

function Row({
  href,
  title,
  subtitle,
  right,
  onPick,
}: {
  href: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onPick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2",
        "hover:bg-muted"
      )}
    >
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        {subtitle ? <div className="text-xs text-mutedFg truncate">{subtitle}</div> : null}
      </div>
      <div className="shrink-0">{right}</div>
    </Link>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetchSearch(q.trim());
        setData(r);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  // Focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      setData(null);
      setLoading(false);
    }
  }, [open]);

  // Keyboard: ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const hubs = useMemo(() => data?.hubs ?? [], [data]);
  const users = useMemo(() => data?.users ?? [], [data]);
  const posts = useMemo(() => data?.posts ?? [], [data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* modal */}
      <div className="absolute left-1/2 top-16 w-[92vw] max-w-2xl -translate-x-1/2">
        <div className="card">
          <div className="card-pad space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Search</div>
              <div className="text-xs text-mutedFg">ESC to close</div>
            </div>

            <Input
              ref={inputRef as any}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search hubs, users, posts…"
            />

            <div className="flex items-center justify-between">
              <div className="text-xs text-mutedFg">
                {loading ? "Searching…" : data ? `Results for: "${data.q}"` : "Type to search"}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const qq = q.trim();
                    if (qq) window.location.href = `/search?q=${encodeURIComponent(qq)}`;
                    onOpenChange(false);
                  }}
                >
                  Open Search Page
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {/* HUBS */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-mutedFg">Hubs</div>
                <div className="grid gap-2">
                  {hubs.length ? (
                    hubs.map((h) => (
                      <Row
                        key={h.id}
                        href={`/h/${h.langCode}`}
                        onPick={() => onOpenChange(false)}
                        title={`${h.name}`}
                        subtitle={`/${h.langCode}`}
                        right={<Badge className="bg-[hsl(var(--brand)/.12)] border-[hsl(var(--brand)/.25)] text-fg">{h.langCode.toUpperCase()}</Badge>}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-mutedFg">No hubs</div>
                  )}
                </div>
              </div>

              {/* USERS */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-mutedFg">Users</div>
                <div className="grid gap-2">
                  {users.length ? (
                    users.map((u) => (
                      <Row
                        key={u.id}
                        href={`/u/${u.username}`}
                        onPick={() => onOpenChange(false)}
                        title={`${u.displayName}`}
                        subtitle={`@${u.username}`}
                        right={
                          <div className="flex gap-2">
                            {u.accountType === "bot" ? <Badge>bot</Badge> : null}
                            {u.verified ? <Badge>verified</Badge> : null}
                          </div>
                        }
                      />
                    ))
                  ) : (
                    <div className="text-sm text-mutedFg">No users</div>
                  )}
                </div>
              </div>

              {/* POSTS */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-mutedFg">Posts</div>
                <div className="grid gap-2">
                  {posts.length ? (
                    posts.map((p) => (
                      <Row
                        key={p.id}
                        href={`/post/${p.id}`}
                        onPick={() => onOpenChange(false)}
                        title={p.title}
                        subtitle={`${p.hub?.langCode?.toUpperCase() ?? "-"} · @${p.author?.username ?? ""} · ${p.type}`}
                        right={<Badge>{p.type}</Badge>}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-mutedFg">No posts</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-1 text-xs text-mutedFg">
              Shortcut: <span className="font-semibold">Ctrl + K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
