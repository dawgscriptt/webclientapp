export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  postId: z.string().min(10).nullable().optional(),
  commentId: z.string().min(10).nullable().optional(),
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const me = (session as any)?.accountId as string | undefined;
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const postId = parsed.data.postId ?? null;
    const commentId = parsed.data.commentId ?? null;
    const value = parsed.data.value;

    const hasPost = !!postId;
    const hasComment = !!commentId;
    if (Number(hasPost) + Number(hasComment) !== 1) {
      return NextResponse.json({ error: "Provide exactly one of postId or commentId" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let existing: { id: string; value: number } | null = null;
      let delta = 0;

      if (postId) {
        existing = await tx.vote.findUnique({
          where: { accountId_postId: { accountId: me, postId } },
          select: { id: true, value: true },
        });

        const prev = existing?.value ?? 0;

        if (value === 0) {
          if (existing) {
            await tx.vote.delete({ where: { id: existing.id } });
            delta = -prev;
          }
        } else {
          if (existing) {
            await tx.vote.update({ where: { id: existing.id }, data: { value } });
            delta = value - prev;
          } else {
            await tx.vote.create({ data: { accountId: me, postId, value } });
            delta = value;
          }
        }

        if (delta !== 0) {
          await tx.post.update({
            where: { id: postId },
            data: { score: { increment: delta } },
          });
        }

        const p = await tx.post.findUnique({ where: { id: postId }, select: { score: true } });
        return { score: p?.score ?? 0, myVote: value as -1 | 0 | 1 };
      }

      // commentId
      existing = await tx.vote.findUnique({
        where: { accountId_commentId: { accountId: me, commentId: commentId! } },
        select: { id: true, value: true },
      });

      const prev = existing?.value ?? 0;

      if (value === 0) {
        if (existing) {
          await tx.vote.delete({ where: { id: existing.id } });
          delta = -prev;
        }
      } else {
        if (existing) {
          await tx.vote.update({ where: { id: existing.id }, data: { value } });
          delta = value - prev;
        } else {
          await tx.vote.create({ data: { accountId: me, commentId: commentId!, value } });
          delta = value;
        }
      }

      if (delta !== 0) {
        await tx.comment.update({
          where: { id: commentId! },
          data: { score: { increment: delta } },
        });
      }

      const c = await tx.comment.findUnique({ where: { id: commentId! }, select: { score: true } });
      return { score: c?.score ?? 0, myVote: value as -1 | 0 | 1 };
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Vote failed" }, { status: 500 });
  }
}
