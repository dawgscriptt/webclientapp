import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useProfile(username: string) {
  return useSWR(`/api/users/${encodeURIComponent(username)}`, (u) => apiGet(u));
}
