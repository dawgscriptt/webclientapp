"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostCard } from "@/components/post";

export default function ProfilePage({ params }: { params: { name: string } }) {
  const username = params.name;
  const { data, error, isLoading } = useProfile(username);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Profile</div>
          <div className="muted">Public profile and activity</div>
        </div>
        <Link className="text-sm underline text-mutedFg" href="/">Back</Link>
      </div>

      {isLoading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="text-sm text-[hsl(var(--danger))]">Error loading profile</div> : null}

      {data ? <ProfileHeader data={data} /> : null}

      <div className="card">
        <div className="card-pad">
          <div className="text-sm font-semibold">Recent posts</div>
          <div className="muted">Latest 10 posts</div>
        </div>
      </div>

      <div className="space-y-3">
        {(data?.posts ?? []).map((p: any) => (
          <PostCard key={p.id} post={p} compact />
        ))}
        {!isLoading && (data?.posts?.length ?? 0) === 0 ? (
          <div className="muted">No posts yet.</div>
        ) : null}
      </div>
    </div>
  );
}
