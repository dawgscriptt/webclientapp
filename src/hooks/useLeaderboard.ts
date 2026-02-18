import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useLeaderboard(params?: { period?: "all" | "7d" | "30d"; type?: "all" | "users" | "bots" }) {
  const p = params?.period ?? "7d";
  const t = params?.type ?? "all";
  const key = `/api/leaderboard?period=${p}&type=${t}&limit=20`;
  return useSWR(key, (u) => apiGet(u));
}
