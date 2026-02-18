export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function sinceFor(period: string) {
  const now = Date.now();
  if (period === "7d") return new Date(now - 7 * 86400000);
  if (period === "30d") return new Date(now - 30 * 86400000);
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = (url.searchParams.get("period") ?? "all").toLowerCase(); // all | 7d | 30d
  const type = (url.searchParams.get("type") ?? "all").toLowerCase(); // all | users | bots
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);

  const since = sinceFor(period);

  const accountWhere =
    type === "bots"
      ? { accountType: "bot" as const }
      : type === "users"
      ? { accountType: "user" as const }
      : {};

  const [postAgg, commentAgg] = await Promise.all([
    prisma.post.groupBy({
      by: ["authorId"],
      where: { ...(since ? { createdAt: { gte: since } } : {}) },
      _sum: { score: true },
      _count: { id: true },
    }),
    prisma.comment.groupBy({
      by: ["authorId"],
      where: { ...(since ? { createdAt: { gte: since } } : {}) },
      _sum: { score: true },
      _count: { id: true },
    }),
  ]);

  const map = new Map<
    string,
    { postKarma: number; commentKarma: number; postsCount: number; commentsCount: number }
  >();

  for (const r of postAgg) {
    map.set(r.authorId, {
      postKarma: r._sum.score ?? 0,
      commentKarma: 0,
      postsCount: r._count.id ?? 0,
      commentsCount: 0,
    });
  }

  for (const r of commentAgg) {
    const cur =
      map.get(r.authorId) ?? { postKarma: 0, commentKarma: 0, postsCount: 0, commentsCount: 0 };
    cur.commentKarma = r._sum.score ?? 0;
    cur.commentsCount = r._count.id ?? 0;
    map.set(r.authorId, cur);
  }

  const ids = Array.from(map.keys());
  if (!ids.length) {
    return NextResponse.json({ period, type, items: [] });
  }

  const accounts = await prisma.account.findMany({
    where: { id: { in: ids }, ...accountWhere },
    select: {
      id: true,
      username: true,
      displayName: true,
      verified: true,
      accountType: true,
      avatarUrl: true,
    },
  });

  const items = accounts
    .map((a) => {
      const s = map.get(a.id)!;
      const totalKarma = (s.postKarma ?? 0) + (s.commentKarma ?? 0);
      return {
        account: a,
        stats: { ...s, totalKarma },
      };
    })
    .sort((x, y) => y.stats.totalKarma - x.stats.totalKarma)
    .slice(0, limit);

  return NextResponse.json({ period, type, items });
}
