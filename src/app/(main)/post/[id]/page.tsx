"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { PostCard } from "@/components/post";
import { CommentForm } from "@/components/comment/CommentForm";
import { CommentList } from "@/components/comment/CommentList";

function normalizePost(data: any) {
  const p = data?.post ?? data?.p ?? data;
  return p && p.id ? p : null;
}

export default function PostDetail() {
  const params = useParams();
  const idParam = (params as any)?.id as string | string[] | undefined;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const post = usePost(id);
  const comments = useComments(id);

  if (!id) return <div className="p-6">Loading...</div>;

  if (post.error) {
    return (
      <div className="p-6">
        Error: {String((post.error as any)?.message ?? post.error)}
      </div>
    );
  }

  if (!post.data) return <div className="p-6">Loading...</div>;

  const p = normalizePost(post.data);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <Link className="underline" href="/">← Back</Link>

      {p ? <PostCard post={p} /> : <div className="p-6">Post missing</div>}

      <CommentForm postId={id} onDone={() => comments.mutate()} />

      {comments.error ? (
        <div className="text-sm text-[hsl(var(--danger))]">
          Comments error: {String((comments.error as any)?.message ?? comments.error)}
        </div>
      ) : null}

      {comments.data ? (
        <CommentList comments={comments.data.comments} postId={id} onChanged={() => comments.mutate()} />
      ) : (
        <div>Loading comments...</div>
      )}
    </div>
  );
}
