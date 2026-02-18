type Bucket = { count: number; resetAt: number };
const mem = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = mem.get(key);
  if (!b || now > b.resetAt) {
    mem.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (b.count >= limit) return { ok: false as const, remaining: 0, resetAt: b.resetAt };
  b.count += 1;
  return { ok: true as const, remaining: Math.max(0, limit - b.count), resetAt: b.resetAt };
}
