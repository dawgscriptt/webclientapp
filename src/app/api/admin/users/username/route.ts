export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

function isStaff(role?: string) {
  return role === "admin" || role === "mod";
}

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!session || !isStaff(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = params.username;

  const user = await prisma.account.findUnique({
    where: { username },
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
      _count: { select: { posts: true, comments: true, messages: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

const patchSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(280).optional().nullable(),
  role: z.enum(["user", "mod", "admin"]).optional(),
  verified: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!session || !isStaff(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const username = params.username;

  const exists = await prisma.account.findUnique({ where: { username }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.account.update({
    where: { username },
    data: parsed.data,
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
      _count: { select: { posts: true, comments: true, messages: true } },
    },
  });

  return NextResponse.json({ user });
}
