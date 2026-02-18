"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const txt = await res.text();
  if (!res.ok) throw new Error(txt || "Failed");
  return JSON.parse(txt);
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, error, isLoading, mutate } = useSWR(id ? `/api/admin/users/${id}` : null, fetcher);

  const u = data?.user;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // ilk load’da formu doldur
  if (!form && u) {
    setForm({
      displayName: u.displayName ?? "",
      bio: u.bio ?? "",
      avatarUrl: u.avatarUrl ?? "",
      dmPolicy: u.dmPolicy ?? "everyone",
      verified: !!u.verified,
      role: u.role ?? "user",
    });
  }

  async function save() {
    if (!id) return;
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio || null,
          avatarUrl: form.avatarUrl || null,
          dmPolicy: form.dmPolicy,
          verified: !!form.verified,
          role: form.role,
        }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || "Save failed");
      await mutate();
      setMsg("Saved ✅");
    } catch (e: any) {
      setMsg(`Save failed: ${String(e?.message ?? e)}`);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="p-6 muted">Loading…</div>;
  if (error) return <div className="p-6 text-sm text-[hsl(var(--danger))]">Failed: {String(error.message ?? error)}</div>;
  if (!u || !form) return <div className="p-6 muted">Not found</div>;

  return (
    <div className="space-y-3">
      <div className="card">
        <div className="card-pad flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar url={u.avatarUrl} name={u.displayName} username={u.username} className="h-12 w-12" />
            <div className="min-w-0">
              <div className="text-lg font-extrabold truncate">{u.displayName}</div>
              <div className="text-xs text-mutedFg truncate">@{u.username} · {u.auth?.email ?? "no-email"}</div>
              <div className="text-xs text-mutedFg">Posts: {u._count?.posts ?? 0} · Comments: {u._count?.comments ?? 0}</div>
            </div>
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-mutedFg mb-1">Display name</div>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>

            <div>
              <div className="text-xs text-mutedFg mb-1">Avatar URL</div>
              <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
            </div>

            <div>
              <div className="text-xs text-mutedFg mb-1">Role</div>
              <select
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm w-full"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">user</option>
                <option value="mod">mod</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-mutedFg mb-1">DM policy</div>
              <select
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm w-full"
                value={form.dmPolicy}
                onChange={(e) => setForm({ ...form, dmPolicy: e.target.value })}
              >
                <option value="everyone">everyone</option>
                <option value="friends">friends</option>
                <option value="noone">noone</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.verified}
                onChange={(e) => setForm({ ...form, verified: e.target.checked })}
              />
              Verified
            </label>
          </div>

          <div>
            <div className="text-xs text-mutedFg mb-1">Bio</div>
            <textarea
              className="input min-h-[120px]"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          {msg ? <div className="text-sm">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}
