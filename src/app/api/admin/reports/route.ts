export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { isModOrAdmin } from "@/lib/permissions";
import { notifyMods } from "@/lib/notify";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!isModOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") ?? "open") as "open" | "closed";

  const items = await prisma.report.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { username: true, displayName: true } },
      reviewedBy: { select: { username: true } },
    },
  });

  return NextResponse.json({ items });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["open", "closed"]),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  const role = (session as any)?.role as string | undefined;
  if (!me || !isModOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.report.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, reviewedAt: new Date(), reviewedById: me },
  });

  // optional: notify mods about update
  await notifyMods({
    actorId: me,
    type: "report_update",
    title: `Report updated: ${parsed.data.status}`,
    body: `Report ${updated.id} status changed.`,
    url: "/admin/reports",
  });

  return NextResponse.json({ report: updated });
}
