export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createSchema = z.object({
  postId: z.string().min(10),
  parentId: z.string().min(10).optional().nullable(),
  body: z.string().trim().min(1).max(4000),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

    // ✅ session optional (myVote için)
    const session = await getServerSession(authOptions).catch(() => null);
    const me = (session as any)?.accountId as string | undefined;

    const rows = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        postId: true,
        parentId: true,
        body: true,
        score: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
            accountType: true,
            role: true,
          },
        },
        // ✅ user's vote for this comment (0/1 row)
        votes: me
          ? {
              where: { accountId: me },
              select: { value: true },
              take: 1,
            }
          : undefined,
      } as any,
    });

    // normalize: attach myVote
    const flat = rows.map((c: any) => ({
      ...c,
      myVote: me ? (c.votes?.[0]?.value ?? 0) : 0,
      votes: undefined, // payload sade
    }));

    // tree build
    const byId = new Map<string, any>();
    const roots: any[] = [];

    for (const c of flat) byId.set(c.id, { ...c, children: [] });

    for (const c of flat) {
      const node = byId.get(c.id);
      if (c.parentId && byId.has(c.parentId)) byId.get(c.parentId).children.push(node);
      else roots.push(node);
    }

    return NextResponse.json({ comments: roots, total: flat.length });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to load comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const me = (session as any)?.accountId as string | undefined;
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (parsed.data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parsed.data.parentId },
        select: { id: true, postId: true },
      });
      if (!parent || parent.postId !== parsed.data.postId) {
        return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
      }
    }

    const created = await prisma.comment.create({
      data: {
        postId: parsed.data.postId,
        parentId: parsed.data.parentId ?? null,
        authorId: me,
        body: parsed.data.body,
      },
      select: {
        id: true,
        postId: true,
        parentId: true,
        body: true,
        score: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
            accountType: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ comment: { ...created, myVote: 0 } });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
