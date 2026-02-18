"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function CommentForm({
  postId,
  parentId,
  onDone,
  onCancel,
  autoFocus,
}: {
  postId: string;
  parentId?: string | null;
  onDone?: () => void;
  onCancel?: () => void; // ✅ new
  autoFocus?: boolean;
}) {
  const { data: session } = useSession();
  const authed = !!(session as any)?.accountId;

  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    const b = body.trim();
    if (!b) return setErr("Write something.");

    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId, parentId: parentId ?? null, body: b }),
      });

      const raw = await res.text();

      // JSON veya text error parse
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}

      if (!res.ok) throw new Error((data?.error ?? raw ?? "Failed").toString());

      setBody("");
      onDone?.();
    } catch (e: any) {
      setErr(e?.message?.slice(0, 220) || "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="rounded-xl border border-border bg-muted p-3 text-sm text-mutedFg">
        Login to comment.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <textarea
        className="input min-h-[96px]"
        placeholder={parentId ? "Write a reply…" : "Write a comment…"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        autoFocus={autoFocus}
        disabled={busy}
        onKeyDown={(e) => {
          // ✅ Ctrl/Cmd + Enter -> submit
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          // ✅ Esc -> cancel (reply formda)
          if (e.key === "Escape" && onCancel) {
            e.preventDefault();
            onCancel();
          }
        }}
      />

      {err ? <div className="text-sm text-[hsl(var(--danger))]">{err}</div> : null}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <button className="btn" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        ) : null}

        <button className="btn btn-primary" type="button" onClick={submit} disabled={busy || body.trim().length === 0}>
          {busy ? "Posting…" : parentId ? "Reply" : "Comment"}
        </button>
      </div>

      <div className="text-xs text-mutedFg">
        Tip: Ctrl/Cmd + Enter to send
      </div>
    </div>
  );
}
