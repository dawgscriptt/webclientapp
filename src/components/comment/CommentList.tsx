"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CommentForm } from "./CommentForm";
import { VoteButtons } from "@/components/post/VoteButtons";

function timeAgo(d?: string | Date | null) {
  if (!d) return "";
  const t = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(t.getTime())) return "";
  const sec = Math.floor((Date.now() - t.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

function CommentItem({
  c,
  depth,
  postId,
  onChanged,
}: {
  c: any;
  depth: number;
  postId: string;
  onChanged: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);

  if (!c?.id) return null;

  const author = c.author ?? {};
  const name = author?.displayName || author?.username || "unknown";
  const ago = timeAgo(c.createdAt) || "now";

  // deleted comment UX
  const deleted = c.body === "[deleted]";

  return (
    <div className={depth > 0 ? "border-l border-border pl-3" : ""}>
      <div className="flex items-start gap-3">
        {/* ✅ Vote column */}
        <div className="shrink-0 pt-1">
          <VoteButtons commentId={c.id} initialScore={c.score ?? 0} />
        </div>

        {/* Avatar */}
        <Avatar
          url={author?.avatarUrl}
          name={name}
          username={author?.username}
          className="h-7 w-7"
        />

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-mutedFg flex items-center gap-2">
            <Link className="hover:underline truncate" href={`/u/${author?.username ?? ""}`}>
              {name} @{author?.username ?? "unknown"}
            </Link>
            <span>•</span>
            <span>{ago}</span>
          </div>

          <div className="text-sm whitespace-pre-wrap mt-1">
            {deleted ? <span className="text-mutedFg italic">[deleted]</span> : c.body}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-mutedFg">
            <button
              className="hover:underline"
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              disabled={deleted}
              title={deleted ? "Cannot reply to deleted comment" : "Reply"}
            >
              {replyOpen ? "Close reply" : "Reply"}
            </button>
          </div>

          {replyOpen ? (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={c.id}
                autoFocus
                onCancel={() => setReplyOpen(false)}
                onDone={() => {
                  setReplyOpen(false);
                  onChanged();
                }}
              />
            </div>
          ) : null}

          {Array.isArray(c.children) && c.children.length ? (
            <div className="space-y-3 mt-3">
              {c.children.map((ch: any) => (
                <CommentItem
                  key={ch.id}
                  c={ch}
                  depth={depth + 1}
                  postId={postId}
                  onChanged={onChanged}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CommentList({
  comments,
  postId,
  onChanged,
}: {
  comments: any[];
  postId: string;
  onChanged: () => void;
}) {
  const list = useMemo(() => comments ?? [], [comments]);

  return (
    <div className="space-y-3">
      {list.map((c: any) => (
        <div key={c.id} className="card">
          <div className="card-pad">
            <CommentItem c={c} depth={0} postId={postId} onChanged={onChanged} />
          </div>
        </div>
      ))}
      {!list.length ? <div className="muted">No comments yet.</div> : null}
    </div>
  );
}
