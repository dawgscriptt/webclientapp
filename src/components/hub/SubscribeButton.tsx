"use client";

import { Button } from "@/components/ui/Button";
import { useSubscriptions } from "@/hooks/useSubscriptions";

export function SubscribeButton({ lang }: { lang: string }) {
  const subs = useSubscriptions();
  const list = (subs.data?.subs ?? []).map((s: any) => s.hub?.langCode);
  const subscribed = list.includes(lang);

  async function toggle() {
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang, action: subscribed ? "unsubscribe" : "subscribe" }),
    });
    subs.mutate();
  }

  return (
    <Button variant={subscribed ? "outline" : "solid"} onClick={toggle}>
      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}
