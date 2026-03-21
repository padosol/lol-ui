"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RsoCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);

  const success = searchParams.get("success");
  const errorMsg = searchParams.get("error");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (success === "true") {
      router.replace("/mypage?tab=connected-apps");
      return;
    }

    const timer = setTimeout(
      () => router.replace("/mypage?tab=connected-apps"),
      3000
    );
    return () => clearTimeout(timer);
  }, [success, router]);

  if (success !== "true") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-2">
            {errorMsg || "RSO 연동에 실패했습니다."}
          </p>
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
