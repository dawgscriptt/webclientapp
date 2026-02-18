export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createSchema = z.object({
  hub: z.string().min(2).max(10), // langCode
  title: z.string().min(3).max(180),
  type: z.enum(["discussion", "lesson", "quiz", "reading", "listening"]).default("discussion"),
  content: z.any(),
});

function hotScore(score: number, createdAt: Date, now: Date) {
  const ageHours = (now.getTime() - createdAt.getTime()) / 3600000;
  return (score + 1) / Math.pow(ageHours + 2, 1.5);
}

async function attachMyVotes(posts: any[], me?: string) {
  if (!me || !posts?.length) return posts;

  const ids = posts.map((p) => p.id);
  const votes = await prisma.vote.findMany({
    where: { accountId: me, postId: { in: ids } },
    select: { postId: true, value: true },
  });

  const map = new Map(votes.map((v) => [v.postId!, v.value]));
  return posts.map((p) => ({ ...p, myVote: map.get(p.id) ?? 0 }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sort = (url.searchParams.get("sort") ?? "new") as "new" | "top" | "hot" | "rising";
  const hub = url.searchParams.get("hub") ?? undefined; // langCode
  const q = (url.searchParams.get("q") ?? "").trim() || undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);

  // ✅ session: myVote için
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;

  const hubRow = hub
    ? await prisma.hub.findUnique({ where: { langCode: hub }, select: { id: true } })
    : null;

  const where: any = {
    ...(hubRow ? { hubId: hubRow.id } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };

  const include = {
    hub: { select: { langCode: true, name: true } },
    author: { select: { id: true, username: true, displayName: true, avatarUrl: true, verified: true, accountType: true, role: true } },
  };

  // hot & rising: recent batch fetch + score compute
  if (sort === "hot" || sort === "rising") {
    const now = new Date();
    const since =
      sort === "rising" ? new Date(Date.now() - 24 * 3600000) : new Date(Date.now() - 3 * 86400000);

    const batch = await prisma.post.findMany({
      where: { ...where, createdAt: { gte: since } },
      include,
      orderBy: { createdAt: "desc" },
      take: 220,
    });

    const scored = batch.map((p) => ({
      p,
      s: hotScore(p.score, p.createdAt, now) * (sort === "rising" ? 1.15 : 1),
    }));

    scored.sort((a, b) => b.s - a.s);

    let posts = scored.slice(0, limit).map((x) => x.p);
    posts = await attachMyVotes(posts, me);

    return NextResponse.json({ posts, nextCursor: null });
  }

  // new/top: cursor pagination
  const orderBy =
    sort === "top"
      ? [{ score: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const rows = await prisma.post.findMany({
    where,
    include,
    orderBy,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasNext = rows.length > limit;
  let posts: any[] = hasNext ? rows.slice(0, limit) : rows;
  posts = await attachMyVotes(posts, me);

  const nextCursor = hasNext ? posts[posts.length - 1]?.id : null;

  return NextResponse.json({ posts, nextCursor });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const hub = await prisma.hub.findUnique({
    where: { langCode: parsed.data.hub },
    select: { id: true },
  });
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  const post = await prisma.post.create({
    data: {
      hubId: hub.id,
      authorId: me,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
    },
    include: {
      hub: { select: { langCode: true, name: true } },
      author: { select: { username: true, verified: true, accountType: true } },
    },
  });

  return NextResponse.json({ post: { ...post, myVote: 0 } });
}
