export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const grouped = await prisma.progress.groupBy({
    by: ["accountId"],
    _sum: { score: true },
    orderBy: { _sum: { score: "desc" } },
    take: 10,
  });

  const accounts = await prisma.account.findMany({
    where: { id: { in: grouped.map((g) => g.accountId) } },
    select: { id: true, username: true, displayName: true, avatarUrl: true, verified: true, accountType: true },
  });

  const byId = new Map(accounts.map((a) => [a.id, a]));
  const items = grouped
    .map((g) => ({
      user: byId.get(g.accountId),
      score: g._sum.score ?? 0,
    }))
    .filter((x) => x.user);

  return NextResponse.json({ items });
}
