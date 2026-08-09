"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useGoogleLogin } from "@/features/auth";

export default function CallbackPageClient() {
  const t = useTranslations("auth");
  const { handleAuthCallback } = useGoogleLogin();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    handleAuthCallback();
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-medium">{t("processingLogin")}</p>
      </div>
    </div>
  );
}
