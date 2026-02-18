export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const hubs = await prisma.hub.findMany({
    orderBy: { langCode: "asc" },
    include: { _count: { select: { posts: true, lessons: true } } },
  });

  return NextResponse.json({ hubs });
}
