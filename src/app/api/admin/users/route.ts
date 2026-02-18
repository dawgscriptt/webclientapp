export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isStaff(role?: string) {
  return role === "admin" || role === "mod";
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!session || !isStaff(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const take = Math.min(Number(url.searchParams.get("take") ?? "25"), 50);

  const where =
    q.length > 0
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" as const } },
            { displayName: { contains: q, mode: "insensitive" as const } },
            { auth: { is: { email: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {};

  const items = await prisma.account.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      accountType: true,
      verified: true,
      dmPolicy: true,
      createdAt: true,
      updatedAt: true,
      auth: { select: { email: true } },
      _count: { select: { posts: true } },
    },
  });

  return NextResponse.json({ items });
}
