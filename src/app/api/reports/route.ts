export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyMods } from "@/lib/notify";

const schema = z.object({
  targetType: z.string().min(1),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const report = await prisma.report.create({
    data: {
      reporterId: me,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      status: "open",
    },
  });

  await notifyMods({
    actorId: me,
    type: "report_new",
    title: "New report submitted",
    body: `${parsed.data.targetType}:${parsed.data.targetId} — ${parsed.data.reason.slice(0, 140)}`,
    url: "/admin/reports",
    metadata: { reportId: report.id },
  });

  return NextResponse.json({ report });
}
