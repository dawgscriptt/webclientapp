import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useProgress() {
  // MVP: no GET endpoint; keep placeholder for future
  return useSWR(null, () => apiGet<any>("/api/progress"));
}
