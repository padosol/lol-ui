"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { linkRiotAccount } from "@/entities/auth";

export default function RsoCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get("code");
    const platformId = searchParams.get("state") || "kr";
    const errorParam = searchParams.get("error");

    if (errorParam || !code) {
      setError(errorParam || "인증 코드를 받지 못했습니다.");
      setTimeout(() => router.replace("/mypage?tab=connected-apps"), 3000);
      return;
    }

    const redirectUri = `${window.location.origin}/auth/rso/callback`;

    linkRiotAccount({ code, redirectUri, platformId })
      .then(() => {
        router.replace("/mypage?tab=connected-apps");
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.errorMessage || "RSO 연동에 실패했습니다.";
        setError(msg);
        setTimeout(() => router.replace("/mypage?tab=connected-apps"), 3000);
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-2">{error}</p>
          <p className="text-sm text-on-surface-medium">
            잠시 후 마이페이지로 이동합니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-medium">RSO 연동 처리 중...</p>
      </div>
    </div>
  );
}
