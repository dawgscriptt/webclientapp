import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useHub(lang: string) {
  return useSWR(`/api/hubs/${lang}`, (u) => apiGet<{ hub: any }>(u));
}
