"use client";

import { useState } from "react";
import Link from "next/link";
import { useFriends } from "@/hooks/useFriends";
import { apiPost } from "@/lib/api";
import { Input, Button } from "@/components/ui";

export default function FriendsPage() {
  const { data, mutate, isLoading } = useFriends();
  const [username, setUsername] = useState("");

  async function requestFriend() {
    await apiPost("/api/friends/request", { username });
    setUsername("");
    mutate();
  }

  async function accept(requesterId: string) {
    await apiPost("/api/friends/accept", { requesterId });
    mutate();
  }

  async function reject(requesterId: string) {
    await apiPost("/api/friends/reject", { requesterId });
    mutate();
  }

  if (isLoading) return <div className="p-6">Loading...</div>;
  if ((data as any)?.error) return <div className="p-6">Error</div>;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link className="underline" href="/">← Home</Link>
        <h1 className="text-xl font-semibold">Friends</h1>
      </div>

      <div className="flex gap-2">
        <Input placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <Button onClick={requestFriend}>Add</Button>
      </div>

      <section className="space-y-2">
        <div className="font-medium">Friends</div>
        <div className="space-y-2">
          {(data?.friends ?? []).map((u: any) => (
            <div key={u.id} className="rounded border p-3 flex justify-between">
              <span>@{u.username} — {u.displayName}</span>
              <Link className="underline text-sm" href={`/messages?to=${u.username}`}>DM</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="font-medium">Incoming requests</div>
        <div className="space-y-2">
          {(data?.pendingIncoming ?? []).map((u: any) => (
            <div key={u.id} className="rounded border p-3 flex items-center justify-between">
              <span>@{u.username} — {u.displayName}</span>
              <div className="flex gap-2">
                <Button onClick={() => accept(u.id)}>Accept</Button>
                <Button variant="outline" onClick={() => reject(u.id)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="font-medium">Outgoing requests</div>
        <div className="space-y-2">
          {(data?.pendingOutgoing ?? []).map((u: any) => (
            <div key={u.id} className="rounded border p-3">
              Waiting: @{u.username} — {u.displayName}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
