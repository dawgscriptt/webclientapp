"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type SearchResult = {
  q: string;
  hubs: Array<{ id: string; langCode: string; name: string }>;
  users: Array<{ id: string; username: string; displayName: string; verified: boolean; accountType: "user" | "bot" }>;
  posts: Array<any>;
};

export default function SearchPage() {
  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=20`, { credentials: "include" });
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Search</div>
            <div className="muted">Hubs · Users · Posts</div>
          </div>
          <Link className="text-sm underline text-mutedFg" href="/">Back</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type to search…" />
          <div className="text-xs text-mutedFg">{loading ? "Searching…" : data ? `Query: "${data.q}"` : ""}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="card-pad space-y-2">
            <div className="text-sm font-semibold">Hubs</div>
            <div className="space-y-2">
              {(data?.hubs ?? []).map((h) => (
                <Link key={h.id} href={`/h/${h.langCode}`} className="block rounded-xl border border-border p-3 hover:bg-muted">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-xs text-mutedFg">/{h.langCode}</div>
                </Link>
              ))}
              {!loading && !(data?.hubs?.length) ? <div className="text-sm text-mutedFg">No hubs</div> : null}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad space-y-2">
            <div className="text-sm font-semibold">Users</div>
            <div className="space-y-2">
              {(data?.users ?? []).map((u) => (
                <Link key={u.id} href={`/u/${u.username}`} className="block rounded-xl border border-border p-3 hover:bg-muted">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{u.displayName}</div>
                    <div className="flex gap-2">
                      {u.accountType === "bot" ? <Badge>bot</Badge> : null}
                      {u.verified ? <Badge>verified</Badge> : null}
                    </div>
                  </div>
                  <div className="text-xs text-mutedFg">@{u.username}</div>
                </Link>
              ))}
              {!loading && !(data?.users?.length) ? <div className="text-sm text-mutedFg">No users</div> : null}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad space-y-2">
            <div className="text-sm font-semibold">Posts</div>
            <div className="space-y-2">
              {(data?.posts ?? []).map((p) => (
                <Link key={p.id} href={`/post/${p.id}`} className="block rounded-xl border border-border p-3 hover:bg-muted">
                  <div className="font-medium line-clamp-2">{p.title}</div>
                  <div className="text-xs text-mutedFg">
                    {p.hub?.langCode?.toUpperCase() ?? "-"} · @{p.author?.username ?? ""} · {p.type}
                  </div>
                </Link>
              ))}
              {!loading && !(data?.posts?.length) ? <div className="text-sm text-mutedFg">No posts</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
