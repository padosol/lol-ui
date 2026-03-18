"use client";

import { useEffect, useRef } from "react";
import { useGoogleLogin } from "@/features/auth";

export default function CallbackPageClient() {
  const { handleAuthCallback } = useGoogleLogin();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    const hash = window.location.hash;
    if (!hash) return;
    calledRef.current = true;
    handleAuthCallback(hash);
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-medium">로그인 처리 중...</p>
      </div>
    </div>
  );
}
