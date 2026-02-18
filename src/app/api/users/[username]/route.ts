export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  const username = params.username?.toLowerCase();

  const user = await prisma.account.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      verified: true,
      accountType: true,
      dmPolicy: true,
      createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [postAgg, commentAgg, posts, commentsCount] = await Promise.all([
    prisma.post.aggregate({
      where: { authorId: user.id },
      _sum: { score: true },
      _count: { id: true },
    }),
    prisma.comment.aggregate({
      where: { authorId: user.id },
      _sum: { score: true },
      _count: { id: true },
    }),
    prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        hub: { select: { langCode: true, name: true } },
        author: { select: { username: true, verified: true, accountType: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.comment.count({ where: { authorId: user.id } }),
  ]);

  const postKarma = postAgg._sum.score ?? 0;
  const commentKarma = commentAgg._sum.score ?? 0;

  return NextResponse.json({
    user,
    stats: {
      postKarma,
      commentKarma,
      totalKarma: postKarma + commentKarma,
      postsCount: postAgg._count.id ?? 0,
      commentsCount,
    },
    posts,
  });
}
