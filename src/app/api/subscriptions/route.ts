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

  const subs = await prisma.hubSubscription.findMany({
    where: { accountId: me },
    include: { hub: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subs });
}

const schema = z.object({ lang: z.string().min(2).max(10), action: z.enum(["subscribe", "unsubscribe"]) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const hub = await prisma.hub.findUnique({ where: { langCode: parsed.data.lang }, select: { id: true } });
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

  if (parsed.data.action === "subscribe") {
    await prisma.hubSubscription.upsert({
      where: { accountId_hubId: { accountId: me, hubId: hub.id } },
      update: {},
      create: { accountId: me, hubId: hub.id },
    });
  } else {
    await prisma.hubSubscription.deleteMany({ where: { accountId: me, hubId: hub.id } });
  }

  return NextResponse.json({ ok: true });
}
