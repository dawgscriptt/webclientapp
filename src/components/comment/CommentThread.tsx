"use client";

import { useMemo, useState } from "react";
import { useComments } from "@/hooks/useComments";
import { Avatar } from "@/components/ui/Avatar";
import { VoteButtons } from "@/components/post/VoteButtons";

function buildTree(comments: any[]) {
  const byId = new Map<string, any>();
  const roots: any[] = [];

  comments.forEach((c) => byId.set(c.id, { ...c, children: [] }));

  comments.forEach((c) => {
    const node = byId.get(c.id);
    if (c.parentId && byId.has(c.parentId)) byId.get(c.parentId).children.push(node);
    else roots.push(node);
  });

  return roots;
}

export function CommentThread({ postId }: { postId: string }) {
  const { data, error, isLoading, mutate } = useComments(postId);
  const tree = useMemo(() => buildTree(data?.comments ?? []), [data?.comments]);

  if (isLoading) return <div className="muted">Loading comments…</div>;
  if (error) return <div className="muted">Comments failed to load.</div>;

  return (
    <div className="space-y-3">
      <CommentComposer postId={postId} onDone={() => mutate()} />

      <div className="space-y-3">
        {tree.map((c: any) => (
          <CommentNode key={c.id} node={c} depth={0} postId={postId} onRefresh={() => mutate()} />
        ))}
        {!tree.length ? <div className="muted">No comments yet.</div> : null}
      </div>
    </div>
  );
}

function CommentNode({
  node,
  depth,
  postId,
  onRefresh,
}: {
  node: any;
  depth: number;
  postId: string;
  onRefresh: () => void;
}) {
  const [reply, setReply] = useState(false);

  if (!node || !node.id) return null;

  const a = node.author ?? {};
  const score = node.score ?? 0;

  return (
    <div className="flex gap-3">
      {/* ✅ Reddit-style vote column */}
      <div className="shrink-0 pt-1">
        <VoteButtons commentId={node.id} initialScore={score} />
      </div>

      {/* Avatar */}
      <div className="mt-1 shrink-0">
        <Avatar username={a.username} name={a.displayName} url={a.avatarUrl} className="h-7 w-7" />
      </div>

      {/* Comment body */}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-mutedFg flex items-center gap-2">
          <span className="font-semibold text-fg truncate">{a.displayName ?? a.username ?? "unknown"}</span>
          <span className="truncate">@{a.username ?? "unknown"}</span>
        </div>

        <div className="mt-1 whitespace-pre-wrap text-sm">{node.body}</div>

        <div className="mt-2 flex items-center gap-3 text-xs text-mutedFg">
          <button className="hover:underline" onClick={() => setReply((v) => !v)} type="button">
            Reply
          </button>
        </div>

        {reply ? (
          <div className="mt-2">
            <CommentComposer
              postId={postId}
              parentId={node.id}
              onDone={() => {
                setReply(false);
                onRefresh();
              }}
            />
          </div>
        ) : null}

        {node.children?.length ? (
          <div className="mt-3 space-y-3 border-l border-border pl-3">
            {node.children.map((ch: any) => (
              <CommentNode key={ch.id} node={ch} depth={depth + 1} postId={postId} onRefresh={onRefresh} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CommentComposer({
  postId,
  parentId,
  onDone,
}: {
  postId: string;
  parentId?: string;
  onDone: () => void;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!body.trim()) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId, parentId, body }),
      });
      if (!res.ok) throw new Error(await res.text());
      setBody("");
      onDone();
    } catch {
      setErr("Comment failed. Are you logged in?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        className="input min-h-[90px]"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment…"
      />
      {err ? <div className="text-sm text-[hsl(var(--danger))]">{err}</div> : null}
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={busy || body.trim().length === 0} onClick={submit} type="button">
          {busy ? "Sending…" : "Comment"}
        </button>
      </div>
    </div>
  );
}
