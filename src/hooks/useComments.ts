"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  // ❗ JSON dönmediyse bile error mesajı dolu olsun
  if (!res.ok) {
    const msg =
      (data?.error ?? text ?? res.statusText ?? `Request failed (${res.status})`).toString();
    throw new Error(msg);
  }

  // ✅ ok ama JSON parse edemediysek
  if (data === null) {
    throw new Error("Comments API returned non-JSON response.");
  }

  return data;
};

function useComments(postId?: string) {
  const key = postId ? `/api/comments?postId=${encodeURIComponent(postId)}` : null;
  return useSWR(key, fetcher, { revalidateOnFocus: false });
}

export { useComments };
export default useComments;
