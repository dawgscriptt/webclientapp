export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

async function assertMember(conversationId: string, accountId: string) {
  const m = await prisma.conversationMember.findFirst({
    where: { conversationId, accountId },
    select: { id: true },
  });
  return !!m;
}

export async function GET(_: Request, { params }: { params: { conversationId: string } }) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await assertMember(params.conversationId, me);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const convo = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    select: {
      id: true,
      members: { select: { account: { select: { id: true, username: true, displayName: true, avatarUrl: true } } } },
    },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.conversationId },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      body: true,
      senderId: true,
      createdAt: true,
      sender: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ conversation: convo, messages });
}

const sendSchema = z.object({
  body: z.string().min(1).max(4000),
});

export async function POST(req: Request, { params }: { params: { conversationId: string } }) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await assertMember(params.conversationId, me);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = sendSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const msg = await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      senderId: me,
      body: parsed.data.body,
    },
    select: { id: true, body: true, senderId: true, createdAt: true },
  });

  return NextResponse.json({ message: msg });
}
