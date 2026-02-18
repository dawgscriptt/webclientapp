"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function ProfileHeader({ data }: { data: any }) {
  const u = data?.user;
  const s = data?.stats;

  return (
    <div className="card">
      <div className="card-pad flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={u?.displayName ?? u?.username ?? "User"} url={u?.avatarUrl} className="h-12 w-12" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xl font-semibold">{u?.displayName}</div>
              {u?.accountType === "bot" ? <Badge>bot</Badge> : null}
              {u?.verified ? <Badge>verified</Badge> : null}
            </div>
            <div className="text-sm text-mutedFg">@{u?.username}</div>
            {u?.bio ? <div className="mt-1 text-sm">{u.bio}</div> : <div className="mt-1 text-sm text-mutedFg">No bio yet.</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border p-3">
            <div className="text-xs text-mutedFg">Total karma</div>
            <div className="text-lg font-semibold">{s?.totalKarma ?? 0}</div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="text-xs text-mutedFg">Post karma</div>
            <div className="text-lg font-semibold">{s?.postKarma ?? 0}</div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="text-xs text-mutedFg">Comment karma</div>
            <div className="text-lg font-semibold">{s?.commentKarma ?? 0}</div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="text-xs text-mutedFg">Posts</div>
            <div className="text-lg font-semibold">{s?.postsCount ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
