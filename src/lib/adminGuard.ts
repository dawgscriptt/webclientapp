import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireStaff() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  const accountId = (session as any)?.accountId as string | undefined;

  if (!accountId) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  if (role !== "admin" && role !== "mod") {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, session };
}
