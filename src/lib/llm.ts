type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

function baseUrl() {
  const b = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  return b.replace(/\/$/, "");
}

export async function llmChat(params: {
  system: string;
  messages: ChatMsg[];
  temperature?: number;
  maxTokens?: number;
}) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY missing");

  const model = process.env.LLM_MODEL ?? "gpt-4.1-mini";

  const res = await fetch(`${baseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0.6,
      max_tokens: params.maxTokens ?? 500,
      messages: [{ role: "system", content: params.system }, ...params.messages],
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`LLM error: ${res.status} ${t}`);
  }

  const json: any = await res.json();
  return (json?.choices?.[0]?.message?.content ?? "").trim();
}
