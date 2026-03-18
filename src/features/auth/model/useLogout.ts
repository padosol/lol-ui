"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/auth";
import { logout } from "@/entities/auth";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // API 실패해도 로컬 상태는 항상 클리어
    } finally {
      clearAuth();
      router.push("/");
    }
  }

  return { handleLogout };
}
