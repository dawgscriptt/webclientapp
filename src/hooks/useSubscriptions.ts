import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useSubscriptions() {
  return useSWR("/api/subscriptions", (u) => apiGet(u));
}
