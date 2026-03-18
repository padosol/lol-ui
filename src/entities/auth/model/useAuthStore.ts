import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, AuthTokens, MemberProfile } from "../types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,
      setTokens: (tokens: AuthTokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        }),
      setUser: (user: MemberProfile) => set({ user }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          user: null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        user: state.user,
      }),
    }
  )
);
