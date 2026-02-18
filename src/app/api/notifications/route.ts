export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unread") === "1";

  const items = await prisma.notification.findMany({
    where: { accountId: me, ...(unreadOnly ? { readAt: null } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: { select: { username: true, displayName: true, accountType: true, verified: true } } },
  });

  return NextResponse.json({ items });
}
