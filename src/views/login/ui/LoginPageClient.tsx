"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Link } from "@/shared/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/shared/i18n/navigation";
import { GoogleLoginButton } from "@/features/auth";
import { useTranslations } from "next-intl";

function LoginPageContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="relative min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <Link href="/" className="absolute top-6 left-6">
        <Image
          src="/main_logo.png"
          alt="METAPICK.ME"
          width={120}
          height={80}
          priority
        />
      </Link>

      {error && (
        <div className="w-full max-w-[400px] mb-4 px-4 py-3 bg-error/10 border border-error rounded-lg text-sm text-error text-center">
          {error}
        </div>
      )}

      {/* 로그인 카드 */}
      <div className="w-full max-w-[400px] bg-surface-1 rounded-2xl border border-divider p-8">
        <h1 className="text-xl font-bold text-on-surface text-center mb-2">
          {t("login")}
        </h1>
        <p className="text-sm text-on-surface-medium text-center mb-8">
          {t("welcome")}
        </p>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <GoogleLoginButton />
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-xs text-on-surface-disabled">{t("or")}</span>
          <div className="flex-1 h-px bg-divider" />
        </div>

        {/* 이메일 로그인 (준비중) */}
        <div className="space-y-3">
          <input
            type="email"
            disabled
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-3 bg-surface-4 border border-divider rounded-lg text-on-surface placeholder:text-on-surface-disabled text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            className="w-full py-3 bg-primary/30 text-on-surface/40 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            {t("emailLogin")}
          </button>
        </div>
      </div>

      {/* 하단 링크 */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.back()}
          className="text-base text-on-surface hover:text-primary transition-colors cursor-pointer"
        >
          {t("back")}
        </button>
      </div>

      {/* 하단 정보 */}
      <p className="mt-8 text-xs text-on-surface-disabled text-center">
        {t.rich("termsNotice", {
          terms: (chunks) => (
            <Link
              href="/terms-of-service"
              className="underline hover:text-on-surface-medium transition-colors"
            >
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link
              href="/privacy-policy"
              className="underline hover:text-on-surface-medium transition-colors"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}

export default function LoginPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
