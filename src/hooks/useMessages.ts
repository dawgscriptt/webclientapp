"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON but got ${ct || "unknown"} from ${url}: ${text.slice(0, 160)}`);
  }

  return JSON.parse(text);
};

export function useMessages(conversationId?: string) {
  const key = conversationId ? `/api/messages/${encodeURIComponent(conversationId)}` : null;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 2000,
  });
}
