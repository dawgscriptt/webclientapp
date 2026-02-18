"use client";

import { useState } from "react";
import { useFeed, FeedSort } from "@/hooks/useFeed";
import { PostCard } from "@/components/post";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function HomeFeed() {
  const [sort, setSort] = useState<FeedSort>("new");
  const [q, setQ] = useState("");
  const { data, error, isLoading, mutate } = useFeed({ sort, q: q.trim() || undefined });

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-semibold">Global Feed</div>
            <div className="muted">Posts across all hubs</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as FeedSort)}
            >
              <option value="new">new</option>
              <option value="top">top</option>
              <option value="hot">hot</option>
              <option value="rising">rising</option>
            </select>

            <Button variant="outline" onClick={() => mutate()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* search row - compact */}
      <div className="card">
        <div className="card-pad">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-medium">Search titles</div>

            <div className="flex gap-2 w-full md:w-[520px]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search… (e.g. listening, A2, travel)"
              />
              <Button variant="outline" onClick={() => mutate()}>
                Go
              </Button>
            </div>
          </div>

          <div className="muted mt-2">
            Tip: Enter a hub from the left to view that language feed.
          </div>
        </div>
      </div>

      {isLoading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="text-sm text-[hsl(var(--danger))]">Error loading feed</div> : null}

      <div className="space-y-3">
        {(data?.posts ?? []).map((p) => (
          <PostCard key={p.id} post={p} compact />
        ))}
      </div>
    </div>
  );
}
