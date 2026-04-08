"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/auth";
import { exchangeCodeForTokens, getMyProfile } from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

const SERVER_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function useGoogleLogin() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  function initiateGoogleLogin() {
    window.location.href = `${SERVER_ROOT_URL}/oauth2/authorize/google`;
  }

  async function handleAuthCallback() {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

      const error = hashParams.get("error");
      if (error) {
        router.replace(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      const linkSuccess = hashParams.get("linkSuccess");
      if (linkSuccess === "true") {
        router.replace("/mypage?linkSuccess=true");
        return;
      }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/login");
      return;
    }

    try {
      const tokens = await exchangeCodeForTokens(code);
      setTokens(tokens);

      const profile = await getMyProfile();
      setUser(profile);

      router.replace("/");
    } catch {
      router.replace("/login");
    }
  }

  return { initiateGoogleLogin, handleAuthCallback };
}
