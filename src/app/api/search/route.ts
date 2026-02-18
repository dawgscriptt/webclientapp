export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "8"), 20);

  if (!q) {
    // boş query -> hızlı öneriler
    const hubs = await prisma.hub.findMany({ take: 8, orderBy: { langCode: "asc" } });
    return NextResponse.json({ q: "", hubs, users: [], posts: [] });
  }

  const hubs = await prisma.hub.findMany({
    where: {
      OR: [
        { langCode: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { langCode: "asc" },
  });

  const users = await prisma.account.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, username: true, displayName: true, verified: true, accountType: true },
    take: limit,
    orderBy: { username: "asc" },
  });

  const posts = await prisma.post.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    include: {
      hub: { select: { langCode: true, name: true } },
      author: { select: { username: true, verified: true, accountType: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ q, hubs, users, posts });
}
