"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/auth";
import { getMyProfile } from "@/entities/auth";
import type { AuthTokens } from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

export function useGoogleLogin() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  function initiateGoogleLogin() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async function handleAuthCallback(hash: string) {
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const expiresIn = params.get("expiresIn");

    if (!accessToken || !refreshToken || !expiresIn) {
      router.replace("/login");
      return;
    }

    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
      expiresIn: Number(expiresIn),
    };
    setTokens(tokens);

    const profile = await getMyProfile();
    setUser(profile);

    router.replace("/");
  }

  return { initiateGoogleLogin, handleAuthCallback };
}
