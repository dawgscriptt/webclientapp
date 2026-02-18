export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notify } from "@/lib/notify";

const schema = z.object({ username: z.string().min(3) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const to = await prisma.account.findUnique({
    where: { username: parsed.data.username.toLowerCase() },
    select: { id: true, username: true },
  });
  if (!to) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (to.id === me) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const fr = await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: me, addresseeId: to.id } },
    update: { status: "pending" },
    create: { requesterId: me, addresseeId: to.id, status: "pending" },
  });

  await notify({
    accountId: to.id,
    actorId: me,
    type: "friend_request",
    title: "Friend request",
    body: "Someone sent you a friend request.",
    url: "/friends",
  });

  return NextResponse.json({ friendship: fr });
}
