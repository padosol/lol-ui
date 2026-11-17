import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, MemberProfile } from "../types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "unknown",
      setStatus: (status) => set({ status }),
      setUser: (user: MemberProfile) => set({ user, status: "authenticated" }),
      clearAuth: () => set({ user: null, status: "anonymous" }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
