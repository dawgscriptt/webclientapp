export function tutorSystemPrompt(args: {
  lang: string;
  level: string;
  mode: "free" | "roleplay" | "correct";
}) {
  const { lang, level, mode } = args;

  const base = `You are a helpful language tutor.
Target language: ${lang}
Learner level: ${level}
Be concise, friendly, and accurate. Prefer short turns.`;

  if (mode === "correct") {
    return `${base}
Mode: Correct my text.
Rules:
- First: corrected version
- Then: 2-4 bullet points explaining key mistakes
- Then: 1 alternative phrasing.
`;
  }

  if (mode === "roleplay") {
    return `${base}
Mode: Roleplay.
Rules:
- Start by setting a scenario and asking a question in the target language.
- Correct mistakes lightly (inline or short note).
`;
  }

  return `${base}
Mode: Free conversation.
Rules:
- Keep the user talking.
- Ask follow-up questions.
- Gently correct important mistakes.
`;
}
