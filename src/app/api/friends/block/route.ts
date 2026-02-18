export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({ accountId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const other = parsed.data.accountId;
  if (other === me) return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });

  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: me, addresseeId: other } },
    update: { status: "blocked" },
    create: { requesterId: me, addresseeId: other, status: "blocked" },
  });

  return NextResponse.json({ ok: true });
}
