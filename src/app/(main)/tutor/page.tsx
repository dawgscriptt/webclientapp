"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function TutorPage() {
  const [lang, setLang] = useState("en");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Tell me what you want to practice today (speaking, grammar, writing, etc.)." },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!text.trim()) return;
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setText("");
    setBusy(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.reply }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">AI Tutor</div>
            <div className="muted">Realistic corrections + follow-up questions</div>
          </div>
          <select className="input w-[120px]" value={lang} onChange={(e) => setLang(e.target.value)}>
            {["en", "de", "fr", "es", "it", "tr"].map((l) => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-pad">
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl border border-border px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[hsl(var(--brand)/.10)]" : "bg-muted"}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-3" />

          <div className="flex gap-2">
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write something…" />
            <button className="btn btn-primary" disabled={busy} onClick={send}>
              {busy ? "…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
