import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, MemberProfile } from "../types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: MemberProfile) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
