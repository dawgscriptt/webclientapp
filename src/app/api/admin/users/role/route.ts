export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { isAdmin } from "@/lib/permissions";

const schema = z.object({
  username: z.string().min(3),
  role: z.enum(["user", "mod", "admin"]),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!isAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.account.update({
    where: { username: parsed.data.username.toLowerCase() },
    data: { role: parsed.data.role as any },
    select: { username: true, role: true },
  });

  return NextResponse.json({ user });
}
