"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { useTrendingHubs } from "@/hooks/useTrendingHubs";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Avatar } from "@/components/ui/Avatar";

export function SidebarWidgets() {
  const trending = useTrendingHubs(7);
  const top = useLeaderboard({ period: "7d", type: "all" });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Trending hubs</div>
          <Link className="text-xs text-mutedFg underline" href="/hubs">View all</Link>
        </div>

        <div className="space-y-2">
          {(trending.data?.items ?? []).slice(0, 5).map((it: any) => (
            <Link
              key={it.hub.id}
              href={`/h/${it.hub.langCode}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 hover:bg-muted"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{it.hub.name}</div>
                <div className="text-xs text-mutedFg">/{it.hub.langCode}</div>
              </div>
              <Badge>{it.posts7d} posts</Badge>
            </Link>
          ))}
          {!trending.isLoading && !(trending.data?.items?.length) ? (
            <div className="text-sm text-mutedFg">No data yet</div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Top learners</div>
          <Link className="text-xs text-mutedFg underline" href="/leaderboard">Leaderboard</Link>
        </div>

        <div className="space-y-2">
          {(top.data?.items ?? []).slice(0, 5).map((it: any, idx: number) => (
            <Link
              key={it.account.id}
              href={`/u/${it.account.username}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 hover:bg-muted"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-mutedFg w-4">{idx + 1}</div>
                <Avatar name={it.account.displayName} url={it.account.avatarUrl} className="h-8 w-8" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.account.displayName}</div>
                  <div className="text-xs text-mutedFg truncate">@{it.account.username}</div>
                </div>
              </div>
              <Badge>{it.stats.totalKarma}</Badge>
            </Link>
          ))}
          {!top.isLoading && !(top.data?.items?.length) ? (
            <div className="text-sm text-mutedFg">No data yet</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
