"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/auth";
import { getMyProfile } from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

const SERVER_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function useGoogleLogin() {
  const router = useRouter();
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

    try {
      const profile = await getMyProfile();
      setUser(profile);
      router.replace("/");
    } catch {
      router.replace("/login");
    }
  }

  return { initiateGoogleLogin, handleAuthCallback };
}
