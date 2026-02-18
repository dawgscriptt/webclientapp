"use client";

import { Markdown } from "@/components/common/Markdown";

export function PostContent({ post }: { post: any }) {
  const type = post?.type;
  const c = post?.content;

  // discussion
  if (type === "discussion") {
    const text =
      typeof c === "string" ? c : typeof c?.text === "string" ? c.text : JSON.stringify(c, null, 2);
    return (
      <div className="rounded-xl border border-border bg-muted p-3">
        <Markdown>{text}</Markdown>
      </div>
    );
  }

  // reading
  if (type === "reading") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-muted p-3 whitespace-pre-wrap text-sm">
          {c?.passage ?? "(no passage)"}
        </div>
        <div className="space-y-2">
          {(c?.questions ?? []).map((q: any, i: number) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="text-sm font-medium">Q{i + 1}: {q.q}</div>
              <div className="text-sm text-mutedFg mt-1">A: {q.a}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // listening
  if (type === "listening") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-muted p-3 whitespace-pre-wrap text-sm">
          {c?.script ?? "(no script)"}
        </div>
        <div className="space-y-2">
          {(c?.questions ?? []).map((q: any, i: number) => (
            <div key={i} className="rounded-xl border border-border p-3 space-y-2">
              <div className="text-sm font-medium">Q{i + 1}: {q.q}</div>
              <div className="grid gap-2 md:grid-cols-2">
                {(q.options ?? []).map((op: string, oi: number) => (
                  <div key={oi} className="rounded-xl border border-border px-3 py-2 text-sm">
                    {String.fromCharCode(65 + oi)}. {op}
                  </div>
                ))}
              </div>
              <div className="text-xs text-mutedFg">Answer: {String.fromCharCode(65 + (q.answer ?? 0))}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // quiz
  if (type === "quiz") {
    return (
      <div className="space-y-2">
        {(c?.quiz ?? c ?? []).map((q: any, i: number) => (
          <div key={i} className="rounded-xl border border-border p-3 space-y-2">
            <div className="text-sm font-medium">{i + 1}. {q.q}</div>
            <div className="grid gap-2 md:grid-cols-2">
              {(q.options ?? []).map((op: string, oi: number) => (
                <div key={oi} className="rounded-xl border border-border px-3 py-2 text-sm">
                  {String.fromCharCode(65 + oi)}. {op}
                </div>
              ))}
            </div>
            {typeof q.answer === "number" ? (
              <div className="text-xs text-mutedFg">Answer: {String.fromCharCode(65 + q.answer)}</div>
            ) : null}
            {q.explain ? <div className="text-xs text-mutedFg">Explain: {q.explain}</div> : null}
          </div>
        ))}
      </div>
    );
  }

  // lesson
  if (type === "lesson") {
    return (
      <div className="space-y-2">
        {(c?.lesson ?? []).map((b: any, i: number) => (
          <div key={i} className="rounded-xl border border-border p-3">
            <div className="text-xs uppercase tracking-wider text-mutedFg">{b.type ?? "block"}</div>
            <div className="whitespace-pre-wrap text-sm mt-1">{b.text ?? ""}</div>
          </div>
        ))}
      </div>
    );
  }

  // fallback
  return (
    <pre className="rounded-xl border border-border bg-muted p-3 text-xs overflow-auto">
      {JSON.stringify(c, null, 2)}
    </pre>
  );
}
