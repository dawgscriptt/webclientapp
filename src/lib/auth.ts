import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const auth = await prisma.userAuth.findUnique({
          where: { email },
          include: { account: true },
        });

        if (!auth) return null;
        const ok = await bcrypt.compare(password, auth.passwordHash);
        if (!ok) return null;

        const a = auth.account;
        return {
          id: a.id,
          name: a.displayName,
          email,
          username: a.username,
          accountType: a.accountType,
          verified: a.verified,
          dmPolicy: a.dmPolicy,
          role: a.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.accountId = u.id;
        token.username = u.username;
        token.accountType = u.accountType;
        token.verified = u.verified;
        token.dmPolicy = u.dmPolicy;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accountId = token.accountId;
      (session as any).username = token.username;
      (session as any).accountType = token.accountType;
      (session as any).verified = token.verified;
      (session as any).dmPolicy = token.dmPolicy;
      (session as any).role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
