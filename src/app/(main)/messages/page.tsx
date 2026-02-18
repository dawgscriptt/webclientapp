"use client";

import Link from "next/link";
import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function MessagesPage() {
  const convos = useConversations();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    const u = username.trim();
    if (!u) return;

    setBusy(true);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: u }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed");
      const data = JSON.parse(text);
      window.location.href = `/messages/${data.conversationId}`;
    } catch (e: any) {
      alert(e?.message?.slice(0, 200) || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad space-y-2">
          <div className="text-lg font-semibold">Messages</div>
          <div className="flex gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Start DM by username…" />
            <Button onClick={start} disabled={busy}>Start</Button>
          </div>
        </div>
      </div>

      {convos.error ? <div className="text-sm text-[hsl(var(--danger))]">Failed to load</div> : null}
      {!convos.data ? <div className="muted">Loading…</div> : null}

      <div className="space-y-2">
        {(convos.data?.items ?? []).map((c: any) => (
          <Link key={c.id} href={`/messages/${c.id}`} className="card block">
            <div className="card-pad flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {c.other?.displayName ? `${c.other.displayName} (@${c.other.username})` : "Conversation"}
                </div>
                <div className="text-sm text-mutedFg truncate">
                  {c.lastMessage?.body ?? "No messages yet"}
                </div>
              </div>
              <div className="text-xs text-mutedFg">Open</div>
            </div>
          </Link>
        ))}
        {convos.data && (convos.data.items?.length ?? 0) === 0 ? (
          <div className="muted">No conversations yet. Start one above.</div>
        ) : null}
      </div>
    </div>
  );
}
