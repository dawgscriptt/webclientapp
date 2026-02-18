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

  const account = await prisma.account.findUnique({
    where: { id: me },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      dmPolicy: true,
      role: true,
      accountType: true,
      verified: true,
    },
  });

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  return NextResponse.json({ account });
}

const avatarSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "avatarUrl must be an absolute URL (http/https) or a relative path like /uploads/..."
  );

const updateSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(280).optional().nullable(),
  dmPolicy: z.enum(["everyone", "friends", "noone"]).optional(),
  avatarUrl: avatarSchema.optional().nullable(),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // normalize: treat "" as null for avatarUrl & bio
  const data = {
    ...parsed.data,
    avatarUrl:
      typeof parsed.data.avatarUrl === "string" && parsed.data.avatarUrl.trim() === ""
        ? null
        : parsed.data.avatarUrl ?? undefined,
    bio:
      typeof parsed.data.bio === "string" && parsed.data.bio.trim() === ""
        ? null
        : parsed.data.bio ?? undefined,
  };

  const account = await prisma.account.update({
    where: { id: me },
    data,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      dmPolicy: true,
    },
  });

  return NextResponse.json({ account });
}
