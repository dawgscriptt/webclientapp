export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/adminGuard";
import { z } from "zod";

const patchSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(280).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  dmPolicy: z.enum(["everyone", "friends", "noone"]).optional(),
  verified: z.boolean().optional(),
  role: z.enum(["user", "mod", "admin"]).optional(),
});

async function findAccount(idOrUsername: string) {
  const key = (idOrUsername ?? "").trim();
  if (!key) return null;

  // username veya id ile bul (ikisi de unique)
  return prisma.account.findFirst({
    where: {
      OR: [{ id: key }, { username: key }],
    },
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
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const user = await findAccount(params.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.account.findFirst({
    where: { OR: [{ id: params.id }, { username: params.id }] },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // (opsiyonel) admin kendi rolünü düşürmesin
  const meId = (gate.session as any)?.accountId as string | undefined;
  if (meId && meId === existing.id && parsed.data.role && parsed.data.role !== "admin") {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  const updated = await prisma.account.update({
    where: { id: existing.id },
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
      auth: { select: { email: true } },
      updatedAt: true,
    },
  });

  return NextResponse.json({ user: updated });
}
