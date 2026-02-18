export function dailyLessonPrompt(args: {
  langCode: string;
  level: "A1" | "A2" | "B1" | "B2";
  topic: string;
}) {
  const { langCode, level, topic } = args;

  return `You are a language teaching bot.
Target language: ${langCode}
CEFR level: ${level}
Topic: ${topic}

Return STRICT JSON only (no markdown, no extra text) in this schema:
{
  "title": string,
  "lang": string,
  "level": string,
  "topic": string,
  "lesson": [{"type":"rule"|"example"|"tip","text":string}],
  "quiz": [{"q":string,"options":[string,string,string,string],"answer":0|1|2|3,"explain":string}]
}

Constraints:
- Keep lesson short (5-8 items).
- Quiz 3 questions max.
- Ensure answers are correct and explanations are brief.
- Use learner-friendly language for explanations.
`;
}
