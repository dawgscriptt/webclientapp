"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { VoteButtons } from "@/components/post/VoteButtons";

function normalizePost(input: any) {
  return input?.post ?? input?.p ?? input;
}

function pickText(p: any) {
  const c = p?.content;
  if (!c) return "";
  if (typeof c === "string") return c;
  if (typeof c?.text === "string") return c.text;
  if (typeof c?.passage === "string") return c.passage;
  if (typeof c?.script === "string") return c.script;
  return "";
}

function getAttachments(p: any) {
  const c = p?.content;
  const atts = typeof c === "object" && c?.attachments && Array.isArray(c.attachments) ? c.attachments : [];
  return atts.filter((a: any) => a?.url);
}

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

export function PostCard({ post, compact }: { post: any; compact?: boolean }) {
  const p = normalizePost(post);
  if (!p || !p.id) return null;

  const { data: session } = useSession();
  const me = (session as any)?.accountId as string | undefined;
  const role = (session as any)?.role as string | undefined;
  const isStaff = role === "admin" || role === "mod";

  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const hub = p?.hub?.langCode;
  const author = p?.author;
  const authorName = author?.displayName || author?.username || "unknown";

  const atts = useMemo(() => getAttachments(p), [p]);
  const firstAtt = atts[0];

  async function onDelete() {
    if (deleting) return;
    const ok = confirm("Delete this post?");
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${p.id}`, { method: "DELETE", credentials: "include" });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Delete failed");

      window.dispatchEvent(new CustomEvent("feed:refresh", { detail: { hub } }));
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const canDelete = !!me && (isStaff || p?.authorId === me || author?.id === me);

  const previewText = pickText(p).trim();
  const preview = previewText.length > 260 ? previewText.slice(0, 260) + "…" : previewText;
  const ago = timeAgo(p?.createdAt) || "just now";

  const mediaClass = compact
    ? "w-full max-h-[460px] object-contain bg-black"
    : "w-full max-h-[620px] object-contain bg-black";

  return (
    <div className="card">
      <div className="card-pad">
        <div className="flex gap-3">
          {/* ✅ Vote column (Reddit-style) */}
          <div className="shrink-0 pt-1">
            <VoteButtons postId={p.id} initialScore={p.score ?? 0} />
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar username={author?.username} name={authorName} url={author?.avatarUrl} className="h-8 w-8" />

                <div className="min-w-0">
                  <div className="text-xs text-mutedFg flex items-center gap-2">
                    {hub ? (
                      <Link className="hover:underline" href={`/h/${hub}`}>
                        h/{hub}
                      </Link>
                    ) : (
                      <span>Global</span>
                    )}
                    <span>•</span>
                    <Link className="hover:underline truncate" href={`/u/${author?.username ?? ""}`}>
                      {authorName} @{author?.username ?? "unknown"}
                    </Link>
                    <span>•</span>
                    <span>{ago}</span>
                  </div>

                  <Link
                    href={`/post/${p.id}`}
                    className="block text-base font-semibold leading-snug mt-1 hover:underline"
                  >
                    {p.title ?? "(untitled)"}
                  </Link>
                </div>
              </div>

              {canDelete ? (
                <button className="btn" disabled={deleting} onClick={onDelete} type="button">
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              ) : null}
            </div>

            {/* media */}
            {firstAtt ? (
              <div className="rounded-xl border border-border overflow-hidden bg-muted">
                {firstAtt.kind === "video" ? (
                  <video src={firstAtt.url} controls className={mediaClass} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={firstAtt.url} alt="media" className={mediaClass} />
                )}
              </div>
            ) : null}

            {/* text */}
            {preview ? (
              <div className="text-sm text-fg whitespace-pre-wrap">{compact ? preview : previewText}</div>
            ) : null}

            {/* footer */}
            <div className="flex items-center gap-3 text-xs text-mutedFg">
              <Link className="hover:underline" href={`/post/${p.id}`}>
                Open
              </Link>
              {hub ? (
                <Link className="hover:underline" href={`/h/${hub}`}>
                  Go to hub
                </Link>
              ) : null}
              <Link className="hover:underline" href={`/u/${author?.username ?? ""}`}>
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
