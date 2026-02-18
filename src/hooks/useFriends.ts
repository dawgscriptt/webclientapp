import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useFriends() {
  return useSWR(`/api/friends`, (u) =>
    apiGet<{ friends: any[]; pendingIncoming: any[]; pendingOutgoing: any[] }>(u)
  );
}
