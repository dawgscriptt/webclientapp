"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [dmPolicy, setDmPolicy] = useState<"everyone" | "friends" | "noone">("everyone");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/accounts/me", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAccount(data.account);
      setDisplayName(data.account.displayName ?? "");
      setBio(data.account.bio ?? "");
      setDmPolicy(data.account.dmPolicy ?? "everyone");
      setAvatarUrl(data.account.avatarUrl ?? "");
    } catch {
      setMsg("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/accounts/me", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName, bio, dmPolicy, avatarUrl: avatarUrl || null }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Saved ✅");
      await load();
    } catch {
      setMsg("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      setMsg("Avatar updated ✅");
      await load();
    } catch {
      setMsg("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="muted">Loading settings…</div>;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-pad flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar username={account?.username} name={displayName} url={avatarUrl} className="h-16 w-16" />
            <div>
              <div className="text-xl font-semibold">Settings</div>
              <div className="muted">@{account?.username}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn" onClick={load} disabled={busy}>Refresh</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>Save</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad space-y-3">
          <div className="text-sm font-semibold">Profile</div>

          <label className="text-sm">Display name</label>
          <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

          <label className="text-sm">Bio</label>
          <textarea className="input min-h-[110px]" value={bio} onChange={(e) => setBio(e.target.value)} />

          <label className="text-sm">DM policy</label>
          <select className="input" value={dmPolicy} onChange={(e) => setDmPolicy(e.target.value as any)}>
            <option value="everyone">Everyone</option>
            <option value="friends">Friends only</option>
            <option value="noone">No one</option>
          </select>

          <div className="divider" />

          <div className="text-sm font-semibold">Avatar</div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm">Upload image</label>
              <input
                className="input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
              <div className="muted mt-2">Local dev: saves to /public/uploads/avatars</div>
            </div>

            <div>
              <label className="text-sm">Or set URL</label>
              <input className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
              <div className="muted mt-2">Paste an image URL if you prefer.</div>
            </div>
          </div>

          {msg ? <div className="muted">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}
