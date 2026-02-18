"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
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
  const query = q.trim();

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/users?q=${encodeURIComponent(query)}&take=25`,
    fetcher
  );

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
            />
            <Button variant="outline" onClick={() => mutate()}>
              Search
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
        {(data?.items ?? []).map((u: any) => (
          <div key={u.id} className="card">
            <div className="card-pad flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  url={u.avatarUrl}
                  name={u.displayName}
                  username={u.username}
                  className="h-10 w-10"
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{u.displayName}</div>
                  <div className="text-xs text-mutedFg truncate">
                    @{u.username} · {u.auth?.email ?? "no-email"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge>{u.role}</Badge>
                <Badge>{u.accountType}</Badge>
                {u.verified ? <Badge>verified</Badge> : null}
                <span className="text-xs text-mutedFg">{u._count?.posts ?? 0} posts</span>

                {/* ✅ DOĞRU LINK: username */}
                <Link
                  className="btn btn-primary"
                  href={`/admin/users/${u.username}`}
                >
                  Manage
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && (data?.items?.length ?? 0) === 0 ? (
          <div className="muted">No users</div>
        ) : null}
      </div>
    </div>
  );
}
