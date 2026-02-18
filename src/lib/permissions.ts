import { prisma } from "@/lib/db";

export async function areFriends(aId: string, bId: string) {
  const fr = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: aId, addresseeId: bId, status: "accepted" },
        { requesterId: bId, addresseeId: aId, status: "accepted" },
      ],
    },
    select: { id: true },
  });
  return !!fr;
}

export function isModOrAdmin(role?: string) {
  return role === "mod" || role === "admin";
}
export function isAdmin(role?: string) {
  return role === "admin";
}

// DM policy checks (friends-only)
export async function canSendDM(fromId: string, toId: string) {
  const to = await prisma.account.findUnique({
    where: { id: toId },
    select: { dmPolicy: true },
  });
  if (!to) return false;
  if (to.dmPolicy === "everyone") return true;
  if (to.dmPolicy === "noone") return false;

  // friends only
  const fr = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: fromId, addresseeId: toId },
        { requesterId: toId, addresseeId: fromId },
      ],
    },
    select: { id: true },
  });
  return !!fr;
}


export async function isBlockedEitherWay(aId: string, bId: string) {
  const bl = await prisma.friendship.findFirst({
    where: {
      status: "blocked",
      OR: [
        { requesterId: aId, addresseeId: bId },
        { requesterId: bId, addresseeId: aId },
      ],
    },
    select: { id: true },
  });
  return !!bl;
}

export async function canSendDm(senderId: string, receiverId: string) {
  if (senderId === receiverId) return { ok: false as const, reason: "self" as const };
  if (await isBlockedEitherWay(senderId, receiverId))
    return { ok: false as const, reason: "blocked" as const };

  const receiver = await prisma.account.findUnique({
    where: { id: receiverId },
    select: { dmPolicy: true },
  });
  if (!receiver) return { ok: false as const, reason: "not_found" as const };

  if (receiver.dmPolicy === "noone") return { ok: false as const, reason: "policy" as const };

  if (receiver.dmPolicy === "friends") {
    const friends = await areFriends(senderId, receiverId);
    if (!friends) return { ok: false as const, reason: "policy" as const };
  }

  return { ok: true as const };
}

/**
 * Bot restriction:
 * - bot cannot be the first message initiator.
 */
export async function assertBotNotInitiatingDm(senderId: string, conversationId: string) {
  const sender = await prisma.account.findUnique({
    where: { id: senderId },
    select: { accountType: true },
  });
  if (sender?.accountType !== "bot") return;

  const firstMsg = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { senderId: true },
  });

  if (!firstMsg) throw new Error("BOT_CANNOT_INITIATE");
  if (firstMsg.senderId === senderId) throw new Error("BOT_CANNOT_INITIATE");
}
