export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const grouped = await prisma.post.groupBy({
    by: ["hubId"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { _all: "desc" } },
    take: 8,
  });

  const hubs = await prisma.hub.findMany({
    where: { id: { in: grouped.map((g) => g.hubId) } },
    select: { id: true, langCode: true, name: true, description: true },
  });

  const byId = new Map(hubs.map((h) => [h.id, h]));
  const items = grouped
    .map((g) => ({
      hub: byId.get(g.hubId),
      posts7d: g._count._all,
    }))
    .filter((x) => x.hub);

  return NextResponse.json({ items });
}
