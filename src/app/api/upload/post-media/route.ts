export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 80;

function extFromType(t: string) {
  if (t === "image/png") return "png";
  if (t === "image/jpeg") return "jpg";
  if (t === "image/webp") return "webp";
  if (t === "video/mp4") return "mp4";
  if (t === "video/webm") return "webm";
  if (t === "video/quicktime") return "mov";
  return "";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) return NextResponse.json({ error: "Only image/video allowed" }, { status: 400 });

  const ext = extFromType(file.type);
  if (!ext) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

  const maxBytes = (isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB) * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB}MB` },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const dir = path.join(process.cwd(), "public", "uploads", "posts");
  await fs.mkdir(dir, { recursive: true });

  const id = crypto.randomUUID();
  const filename = `${me}.${id}.${ext}`;
  const abs = path.join(dir, filename);
  await fs.writeFile(abs, bytes);

  const url = `/uploads/posts/${filename}`;
  const kind = isImage ? "image" : "video";

  return NextResponse.json({ url, kind, mime: file.type, size: file.size });
}
