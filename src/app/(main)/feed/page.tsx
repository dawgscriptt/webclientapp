"use client";

import { useState } from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useFeed, FeedSort } from "@/hooks/useFeed";
import { PostCard } from "@/components/post";
import { Badge } from "@/components/ui/Badge";

export default function PersonalFeedPage() {
  const subs = useSubscriptions();
  const [sort, setSort] = useState<FeedSort>("hot");

  const hubList = (subs.data?.subs ?? []).map((s: any) => s.hub?.langCode).filter(Boolean);
  const hubsParam = hubList.join(",");

  // Basit yaklaşım: subscribed hub’ları tek tek çekmek yerine backend’de scope eklemek daha iyi,
  // ama hızlı MVP: ilk hub’ı kullan veya boşsa “subscribe et” de.
  const feed = useFeed({ sort, hub: hubList[0], limit: 20 });

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Your Feed</div>
            <div className="muted">Subscribed hubs</div>
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="hot">hot</option>
              <option value="rising">rising</option>
              <option value="new">new</option>
              <option value="top">top</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-2">
          <div className="text-sm font-medium">Subscribed hubs</div>
          <div className="flex flex-wrap gap-2">
            {hubList.length ? hubList.map((h: string) => <Badge key={h}>{h.toUpperCase()}</Badge>) : <div className="muted">No subscriptions yet.</div>}
          </div>
          {hubList.length ? (
            <div className="muted">MVP: feed currently shows the first hub ({hubList[0].toUpperCase()}).</div>
          ) : (
            <div className="muted">Go to a hub page and click Subscribe.</div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(feed.data?.posts ?? []).map((p: any) => (
          <PostCard key={p.id} post={p} compact />
        ))}
      </div>
    </div>
  );
}
