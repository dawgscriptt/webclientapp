export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [friendsA, friendsB, incoming, outgoing] = await Promise.all([
    prisma.friendship.findMany({
      where: { requesterId: me, status: "accepted" },
      include: { addressee: { select: { id: true, username: true, displayName: true, verified: true } } },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: me, status: "accepted" },
      include: { requester: { select: { id: true, username: true, displayName: true, verified: true } } },
    }),
    prisma.friendship.findMany({
      where: { addresseeId: me, status: "pending" },
      include: { requester: { select: { id: true, username: true, displayName: true, verified: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: me, status: "pending" },
      include: { addressee: { select: { id: true, username: true, displayName: true, verified: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = [...friendsA.map((f) => f.addressee), ...friendsB.map((f) => f.requester)];

  return NextResponse.json({
    friends,
    pendingIncoming: incoming.map((x) => x.requester),
    pendingOutgoing: outgoing.map((x) => x.addressee),
  });
}
