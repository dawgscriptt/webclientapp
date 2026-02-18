"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminReportsPage() {
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch(`/api/admin/reports?status=${status}`, { credentials: "include" });
    if (!res.ok) {
      setErr("Forbidden or error");
      setItems([]);
      return;
    }
    const json = await res.json();
    setItems(json.items ?? []);
  }

  async function setReportStatus(id: string, next: "open" | "closed") {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    load();
  }

  useEffect(() => { load(); }, [status]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Moderation · Reports</div>
            <div className="muted">Review and resolve user reports</div>
          </div>
          <Link className="text-sm underline text-mutedFg" href="/">Back</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-pad flex items-center gap-2">
          <select className="rounded-xl border border-border bg-card px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="open">open</option>
            <option value="closed">closed</option>
          </select>
          <Button variant="outline" onClick={load}>Refresh</Button>
          {err ? <div className="text-sm text-[hsl(var(--danger))] ml-2">{err}</div> : null}
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-2">
          {items.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">
                  {r.targetType}:{r.targetId}
                </div>
                <div className="flex gap-2">
                  <Badge>{r.status}</Badge>
                  <Badge>@{r.reporter?.username}</Badge>
                </div>
              </div>
              <div className="text-sm text-mutedFg">{r.reason}</div>

              <div className="flex gap-2">
                {r.status !== "closed" ? (
                  <Button size="sm" variant="outline" onClick={() => setReportStatus(r.id, "closed")}>Close</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setReportStatus(r.id, "open")}>Reopen</Button>
                )}
              </div>
            </div>
          ))}
          {!items.length ? <div className="muted">No reports.</div> : null}
        </div>
      </div>
    </div>
  );
}
