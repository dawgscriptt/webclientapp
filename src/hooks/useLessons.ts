import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useLessons(lang: string, type: "reading" | "listening") {
  return useSWR(`/api/lessons?lang=${lang}&type=${type}`, (u) => apiGet<{ lessons: any[] }>(u));
}
