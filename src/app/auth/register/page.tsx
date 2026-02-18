"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, username, displayName, password }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Register failed");
      return;
    }

    await signIn("credentials", { email, password, callbackUrl: "/" });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Register</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Username (a-z0-9_)" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Display name" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password (min 6)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full rounded bg-black p-2 text-white">Create account</button>
      </form>
      <a className="mt-4 inline-block text-sm underline" href="/auth/login">Back to login</a>
    </div>
  );
}
