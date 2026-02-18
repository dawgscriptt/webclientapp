export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

function extFromType(t: string) {
  if (t === "image/png") return "png";
  if (t === "image/jpeg") return "jpg";
  if (t === "image/webp") return "webp";
  return "png";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "image only" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extFromType(file.type);

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(dir, { recursive: true });

  const filename = `${me}.${ext}`;
  const abs = path.join(dir, filename);

  await fs.writeFile(abs, bytes);

  const url = `/uploads/avatars/${filename}`;

  await prisma.account.update({
    where: { id: me },
    data: { avatarUrl: url },
  });

  return NextResponse.json({ avatarUrl: url });
}
