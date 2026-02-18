"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { apiPost } from "@/lib/api";

const TAB_ITEMS = [
  { value: "discussion", label: "Discussion" },
  { value: "lesson", label: "Lesson" },
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
  { value: "quiz", label: "Quiz" },
];

const LEVELS = ["A1","A2","B1","B2","C1","C2"];

export function PostComposer({ defaultHub }: { defaultHub?: string }) {
  const router = useRouter();

  const [tab, setTab] = useState("discussion");
  const [hub, setHub] = useState(defaultHub ?? "en");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("A2");
  const [topic, setTopic] = useState("");

  // discussion
  const [md, setMd] = useState(
`# Hello 👋

Write your post in **Markdown**.

- Ask a question
- Share a tip
- Add code blocks

\`\`\`js
console.log("hello");
\`\`\`
`
  );

  // reading
  const [passage, setPassage] = useState("Short passage here…");
  const [rQ, setRQ] = useState<Array<{ q: string; a: string }>>([
    { q: "Where is the person?", a: "In the city." },
  ]);

  // listening
  const [script, setScript] = useState("Speaker A: …\nSpeaker B: …");
  const [lQ, setLQ] = useState<Array<{ q: string; options: string[]; answer: number }>>([
    { q: "What is the topic?", options: ["Travel", "Food", "Work", "Music"], answer: 0 },
  ]);

  // quiz
  const [quiz, setQuiz] = useState<Array<{ q: string; options: string[]; answer: number; explain?: string }>>([
    { q: "Choose the correct word.", options: ["go", "went", "goed", "going"], answer: 1, explain: "Past of go is went." },
  ]);

  // lesson
  const [lessonItems, setLessonItems] = useState<Array<{ type: string; text: string }>>([
    { type: "vocab", text: "ticket — bilet\nplatform — platform\npractice — pratik yapmak" },
    { type: "grammar", text: "Present Perfect: I have lived… / I have visited…" },
    { type: "phrases", text: "Could you…?\nI’d like to…\nHow much is…?" },
  ]);

  const canSubmit = useMemo(() => title.trim().length >= 3, [title]);

  function addReadingQ() {
    setRQ((x) => [...x, { q: "New question?", a: "Answer" }]);
  }
  function addListeningQ() {
    setLQ((x) => [...x, { q: "New question?", options: ["A","B","C","D"], answer: 0 }]);
  }
  function addQuizQ() {
    setQuiz((x) => [...x, { q: "New question?", options: ["A","B","C","D"], answer: 0 }]);
  }
  function addLessonItem() {
    setLessonItems((x) => [...x, { type: "note", text: "New lesson block…" }]);
  }

  async function submit() {
    if (!canSubmit) return;

    let content: any = {};
    let type = tab;

    if (tab === "discussion") {
      content = { text: md };
    }
    if (tab === "reading") {
      content = { lang: hub, level, passage, questions: rQ };
    }
    if (tab === "listening") {
      content = { lang: hub, level, script, questions: lQ };
    }
    if (tab === "quiz") {
      content = { lang: hub, level, quiz };
    }
    if (tab === "lesson") {
      type = "lesson";
      content = { lang: hub, level, topic, lesson: lessonItems, quiz };
    }

    await apiPost("/api/posts", {
      hub,
      title: title.trim(),
      type,
      content,
    });

    // reset a bit
    setTitle("");
    setTopic("");
    router.refresh();
  }

  return (
    <div className="card">
      <div className="card-pad space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Create</div>
            <div className="muted">Choose a post type and publish</div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-[hsl(var(--brand)/.12)] border-[hsl(var(--brand)/.25)] text-fg">
              Hub {hub.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Tabs value={tab} onChange={setTab} items={TAB_ITEMS} />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1 space-y-2">
            <div className="text-xs uppercase tracking-wider text-mutedFg">Hub</div>
            <select
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              value={hub}
              onChange={(e) => setHub(e.target.value)}
            >
              {["en","de","fr","es","it","tr"].map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 space-y-2">
            <div className="text-xs uppercase tracking-wider text-mutedFg">Level</div>
            <select
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="md:col-span-1 space-y-2">
            <div className="text-xs uppercase tracking-wider text-mutedFg">Topic (optional)</div>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="travel, food, work…" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-mutedFg">Title</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write a clear title…" />
        </div>

        {/* Body per tab */}
        {tab === "discussion" ? (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-mutedFg">Markdown</div>
            <Textarea value={md} onChange={(e) => setMd(e.target.value)} className="min-h-[180px]" />
          </div>
        ) : null}

        {tab === "reading" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-mutedFg">Passage</div>
              <Textarea value={passage} onChange={(e) => setPassage(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-mutedFg">Questions (Q/A)</div>
                <Button variant="outline" size="sm" onClick={addReadingQ}>+ Add</Button>
              </div>

              <div className="space-y-2">
                {rQ.map((it, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                    <Input value={it.q} onChange={(e) => {
                      const v = e.target.value; setRQ(x => x.map((q, idx) => idx===i ? { ...q, q: v } : q));
                    }} placeholder="Question" />
                    <Input value={it.a} onChange={(e) => {
                      const v = e.target.value; setRQ(x => x.map((q, idx) => idx===i ? { ...q, a: v } : q));
                    }} placeholder="Answer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "listening" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-mutedFg">Script (audio later)</div>
              <Textarea value={script} onChange={(e) => setScript(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-mutedFg">MCQ Questions</div>
                <Button variant="outline" size="sm" onClick={addListeningQ}>+ Add</Button>
              </div>

              <div className="space-y-2">
                {lQ.map((it, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                    <Input value={it.q} onChange={(e) => {
                      const v = e.target.value; setLQ(x => x.map((q, idx) => idx===i ? { ...q, q: v } : q));
                    }} placeholder="Question" />
                    <div className="grid gap-2 md:grid-cols-2">
                      {it.options.map((op, oi) => (
                        <Input key={oi} value={op} onChange={(e) => {
                          const v = e.target.value;
                          setLQ(x => x.map((q, idx) => idx===i ? { ...q, options: q.options.map((o, oidx) => oidx===oi ? v : o) } : q));
                        }} placeholder={`Option ${oi+1}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-mutedFg">Correct</span>
                      <select
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
                        value={it.answer}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setLQ(x => x.map((q, idx) => idx===i ? { ...q, answer: v } : q));
                        }}
                      >
                        {it.options.map((_, oi) => <option key={oi} value={oi}>{String.fromCharCode(65+oi)}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "quiz" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-mutedFg">Quiz (MCQ)</div>
              <Button variant="outline" size="sm" onClick={addQuizQ}>+ Add</Button>
            </div>

            <div className="space-y-2">
              {quiz.map((it, i) => (
                <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                  <Input value={it.q} onChange={(e) => {
                    const v = e.target.value; setQuiz(x => x.map((q, idx) => idx===i ? { ...q, q: v } : q));
                  }} placeholder="Question" />
                  <div className="grid gap-2 md:grid-cols-2">
                    {it.options.map((op, oi) => (
                      <Input key={oi} value={op} onChange={(e) => {
                        const v = e.target.value;
                        setQuiz(x => x.map((q, idx) => idx===i ? { ...q, options: q.options.map((o, oidx) => oidx===oi ? v : o) } : q));
                      }} placeholder={`Option ${oi+1}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-mutedFg">Correct</span>
                    <select
                      className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
                      value={it.answer}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setQuiz(x => x.map((q, idx) => idx===i ? { ...q, answer: v } : q));
                      }}
                    >
                      {it.options.map((_, oi) => <option key={oi} value={oi}>{String.fromCharCode(65+oi)}</option>)}
                    </select>
                  </div>
                  <Input value={it.explain ?? ""} onChange={(e) => {
                    const v = e.target.value; setQuiz(x => x.map((q, idx) => idx===i ? { ...q, explain: v } : q));
                  }} placeholder="Explanation (optional)" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "lesson" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-mutedFg">Lesson blocks</div>
              <Button variant="outline" size="sm" onClick={addLessonItem}>+ Add</Button>
            </div>

            <div className="space-y-2">
              {lessonItems.map((it, i) => (
                <div key={i} className="rounded-xl border border-border p-3 space-y-2">
                  <Input value={it.type} onChange={(e) => {
                    const v = e.target.value; setLessonItems(x => x.map((q, idx) => idx===i ? { ...q, type: v } : q));
                  }} placeholder="type: vocab/grammar/phrases/…" />
                  <Textarea value={it.text} onChange={(e) => {
                    const v = e.target.value; setLessonItems(x => x.map((q, idx) => idx===i ? { ...q, text: v } : q));
                  }} />
                </div>
              ))}
            </div>

            <div className="text-xs uppercase tracking-wider text-mutedFg">Quiz (optional)</div>
            <div className="space-y-2">
              {quiz.slice(0, 3).map((it, i) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="text-sm font-medium">{i+1}. {it.q}</div>
                  <div className="text-xs text-mutedFg">This lesson will reuse the Quiz tab items.</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-mutedFg">
            {tab === "discussion" ? "Markdown supported" : "Structured content"}
          </div>
          <Button onClick={submit} disabled={!canSubmit}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
