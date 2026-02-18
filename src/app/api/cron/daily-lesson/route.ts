export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dailyLessonPrompt } from "@/lib/prompts/dailyLesson";
import { z } from "zod";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function chatCompletionText(messages: ChatMessage[]) {
  const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("Missing LLM_API_KEY");

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 900 }),
  });
  if (!res.ok) throw new Error(`LLM_ERROR ${res.status}`);
  const data = (await res.json()) as any;
  return data?.choices?.[0]?.message?.content as string;
}

const lessonJsonSchema = z.object({
  title: z.string(),
  lang: z.string(),
  level: z.string(),
  topic: z.string(),
  lesson: z.array(z.object({ type: z.enum(["rule", "example", "tip"]), text: z.string() })),
  quiz: z.array(
    z.object({
      q: z.string(),
      options: z.array(z.string()).length(4),
      answer: z.number().int().min(0).max(3),
      explain: z.string(),
    })
  ),
});

function pickTopic() {
  const topics = ["Ordering coffee", "Introducing yourself", "Asking directions", "Shopping basics", "Small talk"];
  return topics[Math.floor(Math.random() * topics.length)];
}
function pickLevel(): "A1" | "A2" | "B1" | "B2" {
  const levels = ["A1", "A2", "B1", "B2"] as const;
  return levels[Math.floor(Math.random() * levels.length)];
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hubs = await prisma.hub.findMany({ select: { id: true, langCode: true } });
  const bot = await prisma.account.findUnique({ where: { username: "dailylessonbot" }, select: { id: true } });
  if (!bot) return NextResponse.json({ error: "dailylessonbot missing" }, { status: 500 });

  const results: any[] = [];

  for (const hub of hubs) {
    const level = pickLevel();
    const topic = pickTopic();
    const prompt = dailyLessonPrompt({ langCode: hub.langCode, level, topic });

    let text = "";
    try {
      text = await chatCompletionText([{ role: "system", content: prompt }]);
    } catch (e: any) {
      results.push({ hub: hub.langCode, ok: false, error: String(e?.message ?? e) });
      continue;
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      results.push({ hub: hub.langCode, ok: false, error: "Invalid JSON from LLM" });
      continue;
    }

    const parsed = lessonJsonSchema.safeParse(json);
    if (!parsed.success) {
      results.push({ hub: hub.langCode, ok: false, error: "Schema mismatch" });
      continue;
    }

    const post = await prisma.post.create({
      data: {
        hubId: hub.id,
        authorId: bot.id,
        type: "lesson",
        title: parsed.data.title,
        content: parsed.data,
      },
      select: { id: true },
    });

    results.push({ hub: hub.langCode, ok: true, postId: post.id });
  }

  return NextResponse.json({ ok: true, results });
}
