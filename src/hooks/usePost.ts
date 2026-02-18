"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore non-json
  }

  if (!res.ok) {
    throw new Error((data?.error ?? text ?? `Request failed (${res.status})`).toString());
  }

  return data;
};

export function usePost(id?: string) {
  // ✅ IMPORTANT: key MUST be the actual endpoint, unique per post id
  const key = id ? `/api/posts/${id}` : null;
  return useSWR(key, fetcher, { revalidateOnFocus: false });
}
