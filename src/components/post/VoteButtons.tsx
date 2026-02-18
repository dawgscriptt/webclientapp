"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Props = {
  postId?: string;
  commentId?: string;
  initialScore?: number;
  initialValue?: -1 | 0 | 1; // kullanıcının mevcut oyu
  onVoted?: (next: { score: number; myVote: -1 | 0 | 1 }) => void;
};

function clampVote(v: any): -1 | 0 | 1 {
  if (v === 1 || v === -1) return v;
  return 0;
}

export function VoteButtons({
  postId,
  commentId,
  initialScore = 0,
  initialValue = 0,
  onVoted,
}: Props) {
  const { data: session } = useSession();
  const authed = !!(session as any)?.accountId;

  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState<number>(initialScore);
  const [myVote, setMyVote] = useState<-1 | 0 | 1>(clampVote(initialValue));

  const target = useMemo(() => {
    if (postId) return { kind: "post" as const, id: postId };
    if (commentId) return { kind: "comment" as const, id: commentId };
    return null;
  }, [postId, commentId]);

  if (!target) return null;

  async function sendVote(nextValue: -1 | 0 | 1) {
    if (!authed) {
      alert("Login required to vote.");
      return;
    }
    if (busy) return;

    // ✅ optimistic update
    const prevVote = myVote;
    const prevScore = score;
    const delta = nextValue - prevVote;

    setBusy(true);
    setMyVote(nextValue);
    setScore((s) => s + delta);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          postId: postId ?? null,
          commentId: commentId ?? null,
          value: nextValue,
        }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        // HTML geldiyse (<!DOCTYPE...) JSON değildir
        throw new Error(raw?.slice(0, 140) || "Vote failed");
      }

      if (!res.ok) throw new Error((data?.error ?? raw ?? "Vote failed").toString());

      // ✅ server source of truth
      const serverScore = Number(data?.score ?? (prevScore + delta));
      const serverVote = clampVote(data?.myVote);

      setScore(serverScore);
      setMyVote(serverVote);
      onVoted?.({ score: serverScore, myVote: serverVote });
    } catch (e: any) {
      // rollback
      setScore(prevScore);
      setMyVote(prevVote);
      alert(e?.message?.slice(0, 200) || "Vote failed");
    } finally {
      setBusy(false);
    }
  }

  function clickUp() {
    // aynı oka basınca toggle -> 0
    const next: -1 | 0 | 1 = myVote === 1 ? 0 : 1;
    sendVote(next);
  }

  function clickDown() {
    const next: -1 | 0 | 1 = myVote === -1 ? 0 : -1;
    sendVote(next);
  }

  const upActive = myVote === 1;
  const downActive = myVote === -1;

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <button
        type="button"
        onClick={clickUp}
        disabled={busy}
        className={[
          "h-8 w-8 rounded-lg border border-border grid place-items-center",
          upActive ? "bg-muted text-fg" : "bg-card text-mutedFg hover:bg-muted",
        ].join(" ")}
        aria-label="Upvote"
        title="Upvote"
      >
        ▲
      </button>

      <div className="text-xs font-semibold tabular-nums">{score}</div>

      <button
        type="button"
        onClick={clickDown}
        disabled={busy}
        className={[
          "h-8 w-8 rounded-lg border border-border grid place-items-center",
          downActive ? "bg-muted text-fg" : "bg-card text-mutedFg hover:bg-muted",
        ].join(" ")}
        aria-label="Downvote"
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
