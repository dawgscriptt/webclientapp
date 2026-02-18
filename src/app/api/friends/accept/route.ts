export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notify } from "@/lib/notify";

const schema = z.object({ requesterId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const fr = await prisma.friendship.findUnique({
    where: { requesterId_addresseeId: { requesterId: parsed.data.requesterId, addresseeId: me } },
  });
  if (!fr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.friendship.update({
    where: { id: fr.id },
    data: { status: "accepted" },
  });

  await notify({
    accountId: parsed.data.requesterId,
    actorId: me,
    type: "friend_accept",
    title: "Friend request accepted",
    body: "Your friend request was accepted.",
    url: "/friends",
  });

  return NextResponse.json({ friendship: updated });
}
