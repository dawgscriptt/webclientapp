export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  all: z.boolean().optional(),
  ids: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (parsed.data.all) {
    await prisma.notification.updateMany({
      where: { accountId: me, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (parsed.data.ids?.length) {
    await prisma.notification.updateMany({
      where: { accountId: me, id: { in: parsed.data.ids } },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
