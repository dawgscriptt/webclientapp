"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMessages } from "@/hooks/useMessages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

function timeHHMM(d: any) {
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const { data: session } = useSession();
  const me = (session as any)?.accountId as string | undefined;

  const swr = useMessages(id);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const other = useMemo(() => {
    const members = swr.data?.conversation?.members ?? [];
    const accounts = members.map((m: any) => m.account);
    return accounts.find((a: any) => a?.id && a.id !== me) ?? null;
  }, [swr.data, me]);

  useEffect(() => {
    // yeni mesaj gelince aşağı scroll
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [swr.data?.messages?.length]);

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);

    // Optimistic message
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      body,
      senderId: me,
      createdAt: new Date().toISOString(),
      sender: {
        username: (session as any)?.username ?? "me",
        displayName: (session as any)?.displayName ?? "Me",
        avatarUrl: (session as any)?.avatarUrl ?? null,
      },
    };

    // UI’ya hemen ekle
    swr.mutate(
      (prev: any) =>
        prev
          ? { ...prev, messages: [...(prev.messages ?? []), optimistic] }
          : { conversation: swr.data?.conversation, messages: [optimistic] },
      false
    );

    setText("");

    try {
      const res = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Send failed");

      const data = JSON.parse(raw);

      // Optimistic’i gerçek mesajla değiştir
      swr.mutate((prev: any) => {
        const list = (prev?.messages ?? []).filter((m: any) => m.id !== optimistic.id);
        return { ...(prev ?? {}), messages: [...list, data.message] };
      }, false);

      // İstersen arka planda doğrulat
      swr.mutate();
    } catch (e: any) {
      // rollback: optimistic’i kaldır
      swr.mutate((prev: any) => {
        const list = (prev?.messages ?? []).filter((m: any) => m.id !== optimistic.id);
        return { ...(prev ?? {}), messages: list };
      }, false);

      setText(body); // geri koy
      alert(e?.message?.slice(0, 200) || "Send failed");
    } finally {
      setBusy(false);
    }
  }

  if (!id) return <div className="p-6">Loading…</div>;

  if (swr.error) {
    return (
      <div className="p-6 space-y-2">
        <div className="text-sm text-[hsl(var(--danger))]">Failed to load conversation</div>
        <pre className="text-xs whitespace-pre-wrap">{String((swr.error as any)?.message ?? swr.error)}</pre>
        <Link className="underline" href="/messages">
          ← Back
        </Link>
      </div>
    );
  }

  if (!swr.data) return <div className="p-6">Loading…</div>;

  const messages = swr.data?.messages ?? [];

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link className="text-sm underline" href="/messages">
              ← Back
            </Link>
            <div className="w-px h-5 bg-border" />
            {other ? (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar name={other.displayName} url={other.avatarUrl} className="h-8 w-8" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{other.displayName}</div>
                  <div className="text-xs text-mutedFg truncate">@{other.username}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold">Conversation</div>
            )}
          </div>

          <div className="text-xs text-mutedFg">{messages.length} messages</div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad">
          <div className="max-h-[60vh] overflow-auto space-y-2">
            {messages.length === 0 ? (
              <div className="muted">No messages yet. Say hi 👋</div>
            ) : null}

            {messages.map((m: any) => {
              const mine = m.senderId && me && m.senderId === me;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl border border-border px-3 py-2 ${
                      mine ? "bg-muted" : "bg-card"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                    <div className="mt-1 text-[11px] text-mutedFg text-right">
                      {timeHHMM(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button onClick={send} disabled={busy || !text.trim()}>
              {busy ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
