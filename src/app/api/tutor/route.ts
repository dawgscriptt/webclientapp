export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  lang: z.string().min(2).max(10).default("en"),
  messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })).min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.accountId as string | undefined;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const baseUrl = process.env.LLM_BASE_URL;         // e.g. https://api.openai.com/v1
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  // fallback: mock tutor
  if (!baseUrl || !apiKey) {
    const lastUser = [...parsed.data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    return NextResponse.json({
      reply:
        `Tutor (${parsed.data.lang}): I understood: "${lastUser}".\n\nTry saying it in a simpler way and I'll correct it.`,
    });
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You are a realistic language tutor. Be concise. Correct mistakes, give 2 alternatives, and ask 1 follow-up question. Keep it friendly.",
        },
        ...parsed.data.messages,
      ],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "LLM request failed" }, { status: 500 });

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content ?? "No reply";
  return NextResponse.json({ reply });
}
