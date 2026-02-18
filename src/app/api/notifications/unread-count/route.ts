export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ count: 0 });

  const count = await prisma.notification.count({
    where: { accountId: me, readAt: null },
  });

  return NextResponse.json({ count });
}
