"use client";

import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function NotificationsPage() {
  const n = useNotifications(false);

  async function markAll() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    n.mutate();
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Notifications</div>
            <div className="muted">Mentions, messages, requests</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAll}>Mark all read</Button>
            <Link className="text-sm underline text-mutedFg" href="/">Back</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-2">
          {(n.data?.items ?? []).map((it: any) => (
            <a
              key={it.id}
              href={it.url ?? "/"}
              className="block rounded-xl border border-border p-3 hover:bg-muted"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{it.title}</div>
                <div className="flex gap-2">
                  {it.readAt ? <Badge>read</Badge> : <Badge className="bg-[hsl(var(--brand)/.12)] border-[hsl(var(--brand)/.25)] text-fg">unread</Badge>}
                  <Badge>{it.type}</Badge>
                </div>
              </div>
              {it.body ? <div className="text-sm text-mutedFg mt-1">{it.body}</div> : null}
              {it.actor ? <div className="text-xs text-mutedFg mt-1">by @{it.actor.username}</div> : null}
            </a>
          ))}
          {!n.isLoading && !(n.data?.items?.length) ? <div className="muted">No notifications.</div> : null}
        </div>
      </div>
    </div>
  );
}
