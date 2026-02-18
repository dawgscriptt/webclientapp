"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"all" | "7d" | "30d">("7d");
  const [type, setType] = useState<"all" | "users" | "bots">("all");
  const { data, isLoading } = useLeaderboard({ period, type });

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Leaderboard</div>
            <div className="muted">Top karma earners</div>
          </div>
          <Link className="text-sm underline text-mutedFg" href="/">Back</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex flex-wrap items-center gap-3">
          <div className="text-sm font-medium">Filters</div>
          <select className="rounded-xl border border-border bg-card px-3 py-2 text-sm" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="all">all time</option>
          </select>
          <select className="rounded-xl border border-border bg-card px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="all">all</option>
            <option value="users">users</option>
            <option value="bots">bots</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-3">
          {isLoading ? <div className="muted">Loading…</div> : null}

          <div className="space-y-2">
            {(data?.items ?? []).map((it: any, idx: number) => (
              <Link
                key={it.account.id}
                href={`/u/${it.account.username}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 hover:bg-muted"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 text-sm text-mutedFg">{idx + 1}</div>
                  <Avatar name={it.account.displayName} url={it.account.avatarUrl} className="h-9 w-9" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{it.account.displayName}</div>
                    <div className="text-xs text-mutedFg truncate">@{it.account.username}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {it.account.accountType === "bot" ? <Badge>bot</Badge> : null}
                  {it.account.verified ? <Badge>verified</Badge> : null}
                  <Badge>{it.stats.totalKarma}</Badge>
                </div>
              </Link>
            ))}
            {!isLoading && !(data?.items?.length) ? <div className="muted">No data yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
