import useSWR from "swr";
import { apiGet } from "@/lib/api";

export function useNotifications(unreadOnly?: boolean) {
  const key = unreadOnly ? "/api/notifications?unread=1" : "/api/notifications";
  return useSWR(key, (u) => apiGet(u));
}

export function useUnreadCount() {
  return useSWR("/api/notifications/unread-count", (u) => apiGet(u), { refreshInterval: 8000 });
}
