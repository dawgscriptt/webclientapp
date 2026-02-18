export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { lang: string } }) {
  const hub = await prisma.hub.findUnique({ where: { langCode: params.lang } });
  if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });
  return NextResponse.json({ hub });
}
