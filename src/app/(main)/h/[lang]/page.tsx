"use client";

import { useEffect, useState } from "react";
import { useHub } from "@/hooks/useHub";
import { useFeed } from "@/hooks/useFeed";
import { PostCard } from "@/components/post";
import { Button } from "@/components/ui/Button";
import { SubscribeButton } from "@/components/hub/SubscribeButton";

export default function HubPage({ params }: { params: { lang: string } }) {
  const [sort, setSort] = useState<"new" | "top" | "hot" | "rising">("hot");
  const hub = useHub(params.lang);
  const feed = useFeed({ sort, hub: params.lang });

  // ✅ After Publish: refresh hub feed automatically
  useEffect(() => {
    const onRefresh = (e: any) => {
      // if event carries hub info, only refresh matching hub
      const targetHub = e?.detail?.hub;
      if (!targetHub || targetHub === params.lang) {
        feed.mutate();
      }
    };

    window.addEventListener("feed:refresh", onRefresh as any);
    return () => window.removeEventListener("feed:refresh", onRefresh as any);
  }, [feed, params.lang]);

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">
              Hub: {params.lang.toUpperCase()}{" "}
              <span className="text-sm text-mutedFg font-normal">
                {hub.data?.hub?.name ? `· ${hub.data.hub.name}` : ""}
              </span>
            </div>
            <div className="muted">Language-specific feed</div>
          </div>

          <div className="flex items-center gap-2">
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

            <Button variant="outline" onClick={() => feed.mutate()}>
              Refresh
            </Button>

            <SubscribeButton lang={params.lang} />
          </div>
        </div>
      </div>

      {/* ✅ PostComposer kaldırıldı. Create sadece header’daki modal. */}

      {feed.isLoading ? <div className="muted">Loading…</div> : null}
      {feed.error ? (
        <div className="text-sm text-[hsl(var(--danger))]">Error loading feed</div>
      ) : null}

      <div className="space-y-3">
        {(feed.data?.posts ?? []).map((p) => (
          <PostCard key={p.id} post={p} compact />
        ))}
        {!feed.isLoading && (feed.data?.posts ?? []).length === 0 ? (
          <div className="muted">No posts yet. Click “Create” in the top bar.</div>
        ) : null}
      </div>
    </div>
  );
}
