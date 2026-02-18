"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Attachment = {
  url: string;
  kind: "image" | "video";
  mime?: string;
  size?: number;
};

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function PostComposerModal() {
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  function close() {
    setOpen(false);
    // ✅ reset form when closing
    setResetKey((k) => k + 1);
  }

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>
        Create
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="absolute left-1/2 top-16 w-[min(760px,92vw)] -translate-x-1/2 rounded-2xl border border-border bg-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold">Create post</div>
              <button className="text-sm text-mutedFg hover:underline" onClick={close} type="button">
                Close
              </button>
            </div>

            <div className="p-4">
              <PostComposerInline key={resetKey} onDone={close} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function PostComposerInline({ onDone }: { onDone: () => void }) {
  const router = useRouter();

  const [hub, setHub] = useState("en");
  const [type, setType] = useState<"discussion" | "reading" | "listening" | "quiz" | "lesson">("discussion");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ESC closes modal (nice UX)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setErr(null);
    setUploading(true);

    try {
      const added: Attachment[] = [];

      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f);

        const res = await fetch("/api/upload/post-media", {
          method: "POST",
          credentials: "include",
          body: fd,
        });

        const raw = await res.text();
        const data = safeJsonParse(raw);

        if (!res.ok) throw new Error((data?.error ?? raw ?? "Upload failed").toString());
        if (!data?.url || !data?.kind) throw new Error("Upload response invalid");

        added.push({
          url: data.url,
          kind: data.kind,
          mime: data.mime,
          size: data.size,
        });
      }

      setAttachments((prev) => [...prev, ...added]);
    } catch (e: any) {
      setErr(e?.message?.slice(0, 220) || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  }

  async function submit() {
    setErr(null);

    const t = title.trim();
    if (t.length < 3) {
      setErr("Title too short.");
      return;
    }

    setBusy(true);
    try {
      const content =
        type === "discussion"
          ? { text, attachments }
          : (() => {
              const parsed = safeJsonParse(text);
              if (parsed && typeof parsed === "object") return { ...parsed, attachments };
              // if no valid JSON, still allow
              return { text, attachments };
            })();

      const res = await fetch("/api/posts", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hub, type, title: t, content }),
      });

      const raw = await res.text();
      const data = safeJsonParse(raw);

      if (!res.ok) throw new Error((data?.error ?? raw ?? "Post failed").toString());

      // close + refresh
      onDone();
      window.dispatchEvent(new CustomEvent("feed:refresh", { detail: { hub } }));

      // ✅ if API returns created post id, go to it
      const postId = data?.post?.id;
      if (postId) {
        router.push(`/post/${postId}`);
      } else {
        router.refresh();
      }
    } catch (e: any) {
      setErr(e?.message?.slice(0, 220) || "Post failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
          value={hub}
          onChange={(e) => setHub(e.target.value)}
        >
          {["en", "de", "fr", "es", "it", "tr"].map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="discussion">discussion</option>
          <option value="reading">reading</option>
          <option value="listening">listening</option>
          <option value="quiz">quiz</option>
          <option value="lesson">lesson</option>
        </select>
      </div>

      <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title…" />

      <textarea
        className="input min-h-[160px]"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={type === "discussion" ? "Write…" : "Paste JSON or write text…"}
      />

      <div className="space-y-2">
        <div className="text-sm font-semibold">Attach media</div>

        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          onChange={(e) => uploadFiles(e.target.files)}
          disabled={busy || uploading}
        />

        {attachments.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {attachments.map((a) => (
              <div key={a.url} className="rounded-xl border border-border overflow-hidden bg-muted relative">
                {a.kind === "video" ? (
                  <video src={a.url} className="w-full h-40 object-contain bg-black" controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} className="w-full h-40 object-contain bg-black" alt="attachment" />
                )}

                <button
                  type="button"
                  className="absolute top-2 right-2 rounded-lg border border-border bg-card px-2 py-1 text-xs hover:bg-muted"
                  onClick={() => removeAttachment(a.url)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {err ? <div className="text-sm text-[hsl(var(--danger))] whitespace-pre-wrap">{err}</div> : null}

      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onDone} disabled={busy || uploading} type="button">
          Cancel
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={busy || uploading} type="button">
          {uploading ? "Uploading…" : busy ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
}
