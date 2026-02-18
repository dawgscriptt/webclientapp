"use client";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
  return JSON.parse(text);
};

export function useConversations() {
  return useSWR("/api/messages/conversations", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
}
