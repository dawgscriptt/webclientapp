export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/i, "Only letters, numbers, underscore"),
  displayName: z.string().min(2).max(40),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const username = parsed.data.username.trim().toLowerCase();
  const displayName = parsed.data.displayName.trim();
  const password = parsed.data.password;

  const [emailExists, usernameExists] = await Promise.all([
    prisma.userAuth.findUnique({ where: { email }, select: { accountId: true } }),
    prisma.account.findUnique({ where: { username }, select: { id: true } }),
  ]);

  if (emailExists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  if (usernameExists) return NextResponse.json({ error: "Username already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.account.create({
    data: {
      username,
      displayName,
      accountType: "user",
      verified: false,
      dmPolicy: "everyone",
      auth: {
        create: {
          email,
          passwordHash,
        },
      },
    },
    select: { id: true, username: true },
  });

  return NextResponse.json({ ok: true, account: created });
}
