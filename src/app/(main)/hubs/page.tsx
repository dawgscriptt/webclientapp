"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function HubsPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/hubs", { credentials: "include" });
      setData(await res.json());
    })();
  }, []);

  const hubs = useMemo(() => {
    const arr = data?.hubs ?? [];
    const qq = q.trim().toLowerCase();
    if (!qq) return arr;
    return arr.filter((h: any) =>
      String(h.langCode).toLowerCase().includes(qq) ||
      String(h.name).toLowerCase().includes(qq) ||
      String(h.description ?? "").toLowerCase().includes(qq)
    );
  }, [data, q]);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Explore Hubs</div>
            <div className="muted">All language communities</div>
          </div>
          <Link className="text-sm underline text-mutedFg" href="/">Back</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-2">
          <div className="text-sm font-medium">Search</div>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="english, deutsch, tr…" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {hubs.map((h: any) => (
          <Link key={h.id} href={`/h/${h.langCode}`} className="card hover:bg-muted transition">
            <div className="card-pad space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-lg font-semibold">{h.name}</div>
                <Badge>{String(h.langCode).toUpperCase()}</Badge>
              </div>
              {h.description ? <div className="text-sm text-mutedFg">{h.description}</div> : null}
              <div className="flex gap-2">
                <Badge>{h._count?.posts ?? 0} posts</Badge>
                <Badge>{h._count?.lessons ?? 0} lessons</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
