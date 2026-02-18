import { create } from "zustand";

export type AuthUser = {
  accountId: string;
  username: string;
  displayName?: string;
  accountType?: "user" | "bot";
  verified?: boolean;
  dmPolicy?: "everyone" | "friends" | "noone";
} | null;

type AuthState = {
  user: AuthUser;
  setUser: (u: AuthUser) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clear: () => set({ user: null }),
}));
