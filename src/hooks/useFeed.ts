import useSWR from "swr";
import { apiGet } from "@/lib/api";

export type FeedSort = "new" | "top" | "hot" | "rising";

export function useFeed(params: { sort: FeedSort; hub?: string; q?: string; cursor?: string; limit?: number }) {
  const sp = new URLSearchParams();
  sp.set("sort", params.sort);
  if (params.hub) sp.set("hub", params.hub);
  if (params.q) sp.set("q", params.q);
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.limit) sp.set("limit", String(params.limit));

  const key = `/api/posts?${sp.toString()}`;
  return useSWR(key, (u) => apiGet(u));
}
