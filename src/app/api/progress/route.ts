export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const postSchema = z.object({
  lessonId: z.string().min(1),
  score: z.number().int().min(0).max(100).optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const lessonId = url.searchParams.get("lessonId") ?? undefined;

  const progress = await prisma.progress.findMany({
    where: { accountId: me, ...(lessonId ? { lessonId } : {}) },
    orderBy: { lastSeenAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const p = await prisma.progress.upsert({
    where: { accountId_lessonId: { accountId: me, lessonId: parsed.data.lessonId } },
    update: { score: parsed.data.score ?? 0, lastSeenAt: new Date() },
    create: { accountId: me, lessonId: parsed.data.lessonId, score: parsed.data.score ?? 0 },
  });

  return NextResponse.json({ progress: p });
}
