"use client";

import Link from "next/link";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const txt = await res.text();
  if (!res.ok) throw new Error(txt || "Failed");
  return JSON.parse(txt);
};

export default function AdminUsersPage() {
  const [q, setQ] = useState("");

  // (opsiyonel ama iyi) Enter ile arama + her harfte fetch olmasın
  const [submittedQ, setSubmittedQ] = useState("");
  const key = useMemo(
    () => `/api/admin/users?q=${encodeURIComponent(submittedQ.trim())}&take=25`,
    [submittedQ]
  );

  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  function onSearch() {
    setSubmittedQ(q);
  }

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold">Users</div>
            <div className="muted">Admin user management</div>
          </div>

          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search username / email…"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
            />
            <Button variant="outline" onClick={onSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={() => mutate()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? <div className="muted">Loading…</div> : null}
      {error ? (
        <div className="text-sm text-[hsl(var(--danger))]">
          Failed: {String((error as any)?.message ?? error)}
        </div>
      ) : null}

      <div className="space-y-2">
        {(data?.items ?? []).map((u: any) => {
          const username = u?.username;
          if (!username) return null;

          const href = `/admin/users/${encodeURIComponent(username)}`;

          return (
            <div key={u.id} className="card">
              <div className="card-pad flex items-center justify-between gap-3">
                {/* Left: user */}
                <Link href={href} className="flex items-center gap-3 min-w-0 flex-1 hover:underline">
                  <Avatar url={u.avatarUrl} name={u.displayName} username={username} className="h-10 w-10" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{u.displayName}</div>
                    <div className="text-xs text-mutedFg truncate">
                      @{username} · {u.auth?.email ?? "no-email"}
                    </div>
                  </div>
                </Link>

                {/* Right: badges + manage */}
                <div className="flex items-center gap-2">
                  <Badge>{u.role}</Badge>
                  <Badge>{u.accountType}</Badge>
                  {u.verified ? <Badge>verified</Badge> : null}
                  <span className="text-xs text-mutedFg">{u._count?.posts ?? 0} posts</span>

                  <Link className="btn btn-primary" href={href}>
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && (data?.items?.length ?? 0) === 0 ? <div className="muted">No users</div> : null}
      </div>
    </div>
  );
}
