"use client";

import { useLocale, useTranslations } from "next-intl";
import axios from "axios";
import { useRouter } from "@/shared/i18n/navigation";
import { useAuthStore } from "@/entities/auth";
import { getMyProfile } from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

const SERVER_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function useGoogleLogin() {
  const router = useRouter();
  // 콜백 페이지는 로케일 밖 경로라 URL에 로케일이 없다.
  // (auth) layout 이 NEXT_LOCALE 쿠키로 결정한 값을 여기서 받아 복귀 경로에 붙인다.
  const locale = useLocale();
  const t = useTranslations("auth");
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
        router.replace(`/login?error=${encodeURIComponent(error)}`, { locale });
        return;
      }

      const linkSuccess = hashParams.get("linkSuccess");
      if (linkSuccess === "true") {
        router.replace("/mypage?linkSuccess=true", { locale });
        return;
      }
    }

    try {
      const profile = await getMyProfile();
      setUser(profile);
      router.replace("/", { locale });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        const message =
          err.response.data?.errorMessage || t("rejoinBlocked");
        router.replace(`/login?error=${encodeURIComponent(message)}`, { locale });
      } else {
        router.replace("/login", { locale });
      }
    }
  }

  return { initiateGoogleLogin, handleAuthCallback };
}
