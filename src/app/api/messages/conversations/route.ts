export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.conversationMember.findMany({
    where: { accountId: me },
    select: {
      conversation: {
        select: {
          id: true,
          type: true,
          createdAt: true,
          members: {
            select: {
              account: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, body: true, createdAt: true, senderId: true },
          },
        },
      },
    },
    orderBy: { id: "desc" },
    take: 50,
  });

  const items = memberships.map((m) => {
    const c = m.conversation;
    const others = c.members.map((x) => x.account).filter((a) => a.id !== me);
    return {
      id: c.id,
      type: c.type,
      createdAt: c.createdAt,
      other: others[0] ?? null,
      lastMessage: c.messages[0] ?? null,
    };
  });

  return NextResponse.json({ items });
}

const createSchema = z.object({
  username: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const other = await prisma.account.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });
  if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (other.id === me) return NextResponse.json({ error: "Cannot DM yourself" }, { status: 400 });

  // existing direct conversation?
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "direct",
      members: { some: { accountId: me } },
      AND: [{ members: { some: { accountId: other.id } } }],
    },
    select: { id: true },
  });

  if (existing) return NextResponse.json({ conversationId: existing.id });

  const created = await prisma.conversation.create({
    data: {
      type: "direct",
      members: {
        create: [{ accountId: me }, { accountId: other.id }],
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ conversationId: created.id });
}
