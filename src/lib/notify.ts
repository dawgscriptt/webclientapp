import { prisma } from "@/lib/db";

export async function notify(params: {
  accountId: string;
  actorId?: string | null;
  type:
    | "friend_request"
    | "friend_accept"
    | "message"
    | "mention"
    | "comment_reply"
    | "report_new"
    | "report_update";
  title: string;
  body?: string;
  url?: string;
  metadata?: any;
}) {
  return prisma.notification.create({
    data: {
      accountId: params.accountId,
      actorId: params.actorId ?? null,
      type: params.type as any,
      title: params.title,
      body: params.body,
      url: params.url,
      metadata: params.metadata,
    },
  });
}

export async function notifyMods(params: {
  actorId?: string | null;
  type: "report_new" | "report_update";
  title: string;
  body?: string;
  url?: string;
  metadata?: any;
}) {
  const mods = await prisma.account.findMany({
    where: { role: { in: ["mod", "admin"] } },
    select: { id: true },
  });
  await Promise.all(
    mods.map((m) =>
      notify({
        accountId: m.id,
        actorId: params.actorId ?? null,
        type: params.type,
        title: params.title,
        body: params.body,
        url: params.url,
        metadata: params.metadata,
      })
    )
  );
}

export function extractMentions(text: string) {
  const re = /@([a-zA-Z0-9_]{3,24})/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.add(m[1].toLowerCase());
  return Array.from(out);
}

export async function notifyMentions(params: {
  text: string;
  actorId: string;
  url?: string;
  contextTitle?: string;
}) {
  const usernames = extractMentions(params.text);
  if (!usernames.length) return;

  const accounts = await prisma.account.findMany({
    where: { username: { in: usernames } },
    select: { id: true, username: true },
  });

  await Promise.all(
    accounts
      .filter((a) => a.id !== params.actorId)
      .map((a) =>
        notify({
          accountId: a.id,
          actorId: params.actorId,
          type: "mention",
          title: params.contextTitle ? `Mentioned you: ${params.contextTitle}` : "Mentioned you",
          body: `@${a.username}`,
          url: params.url,
          metadata: { mention: a.username },
        })
      )
  );
}
