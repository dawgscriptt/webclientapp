import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accountId?: string;
    username?: string;
    accountType?: "user" | "bot";
    verified?: boolean;
    dmPolicy?: "everyone" | "friends" | "noone";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: string;
    username?: string;
    accountType?: "user" | "bot";
    verified?: boolean;
    dmPolicy?: "everyone" | "friends" | "noone";
  }
}

declare module "next-auth" {
  interface Session {
    role?: "user" | "mod" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "user" | "mod" | "admin";
  }
}