export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const days = Math.min(Number(url.searchParams.get("days") ?? "7"), 30);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "8"), 30);

  const since = new Date(Date.now() - days * 86400000);

  const agg = await prisma.post.groupBy({
    by: ["hubId"],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    _sum: { score: true },
  });

  const hubIds = agg.map((a) => a.hubId);
  const hubs = await prisma.hub.findMany({
    where: { id: { in: hubIds } },
    select: { id: true, langCode: true, name: true, description: true },
  });

  const hubMap = new Map(hubs.map((h) => [h.id, h]));
  const items = agg
    .map((a) => ({
      hub: hubMap.get(a.hubId),
      posts7d: a._count.id ?? 0,
      score7d: a._sum.score ?? 0,
    }))
    .filter((x) => !!x.hub)
    .sort((a, b) => (b.posts7d - a.posts7d) || (b.score7d - a.score7d))
    .slice(0, limit);

  return NextResponse.json({ days, items });
}
