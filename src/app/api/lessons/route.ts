export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang");
  const type = url.searchParams.get("type");
  if (!lang || !type) return NextResponse.json({ error: "lang and type required" }, { status: 400 });

  const lessons = await prisma.lesson.findMany({
    where: { hub: { langCode: lang }, type: type as any },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ lessons });
}
