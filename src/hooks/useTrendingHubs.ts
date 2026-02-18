import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useTrendingHubs(days = 7) {
  return useSWR(`/api/hubs/trending?days=${days}&limit=8`, (u) => apiGet(u));
}
