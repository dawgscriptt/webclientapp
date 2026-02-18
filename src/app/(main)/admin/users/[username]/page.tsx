"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
  return JSON.parse(text);
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();

  const username =
    Array.isArray((params as any)?.username)
      ? (params as any).username[0]
      : (params as any)?.username;

  const { data, error, isLoading, mutate } = useSWR(
    username ? `/api/admin/users/${encodeURIComponent(username)}` : null,
    fetcher
  );

  const u = data?.user;

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"user" | "mod" | "admin">("user");
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ form init (render içinde setState YOK!)
  useEffect(() => {
    if (!u) return;
    setDisplayName(u.displayName ?? "");
    setBio(u.bio ?? "");
    setRole(u.role ?? "user");
    setVerified(!!u.verified);
  }, [u?.id]);

  async function save() {
    if (!username) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName, bio, role, verified }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Save failed");
      await mutate();
      alert("Saved ✅");
    } catch (e: any) {
      alert(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!username) return <div className="p-6">Loading…</div>;
  if (isLoading) return <div className="p-6">Loading user…</div>;
  if (error)
    return <div className="p-6">Failed: {String((error as any)?.message ?? error)}</div>;
  if (!u) return <div className="p-6">No user</div>;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Admin · User</div>
            <div className="muted">
              @{u.username} · {u.id}
            </div>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-3">
          <div className="text-sm font-semibold">Profile</div>

          <div className="grid gap-2">
            <div className="text-xs text-mutedFg">Display name</div>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-mutedFg">Bio</div>
            <textarea
              className="input min-h-[110px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="grid gap-2">
              <div className="text-xs text-mutedFg">Role</div>
              <select
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="user">user</option>
                <option value="mod">mod</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              <span className="text-sm">Verified</span>
            </label>

            <div className="ml-auto mt-6">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-border text-sm">
            <div className="muted">
              Email: <span className="text-fg">{u.auth?.email ?? "-"}</span>
            </div>
            <div className="muted">
              Posts: {u._count?.posts ?? 0} · Comments: {u._count?.comments ?? 0} · Messages:{" "}
              {u._count?.messages ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
