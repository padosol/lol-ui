"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@/features/auth";

export default function LoginPageClient() {
  const router = useRouter();

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

      {/* 로그인 카드 */}
      <div className="w-full max-w-[400px] bg-surface-1 rounded-2xl border border-divider p-8">
        <h1 className="text-xl font-bold text-on-surface text-center mb-2">
          로그인
        </h1>
        <p className="text-sm text-on-surface-medium text-center mb-8">
          METAPICK에 오신 것을 환영합니다
        </p>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <GoogleLoginButton />
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-xs text-on-surface-disabled">또는</span>
          <div className="flex-1 h-px bg-divider" />
        </div>

        {/* 이메일 로그인 (준비중) */}
        <div className="space-y-3">
          <input
            type="email"
            disabled
            placeholder="이메일 주소"
            className="w-full px-4 py-3 bg-surface-4 border border-divider rounded-lg text-on-surface placeholder:text-on-surface-disabled text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            className="w-full py-3 bg-primary/30 text-on-surface/40 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            이메일로 계속하기 (준비중)
          </button>
        </div>
      </div>

      {/* 하단 링크 */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.back()}
          className="text-base text-on-surface hover:text-primary transition-colors cursor-pointer"
        >
          돌아가기
        </button>
      </div>

      {/* 하단 정보 */}
      <p className="mt-8 text-xs text-on-surface-disabled text-center">
        로그인 시{" "}
        <Link href="/terms-of-service" className="underline hover:text-on-surface-medium transition-colors">이용약관</Link> 및{" "}
        <Link href="/privacy-policy" className="underline hover:text-on-surface-medium transition-colors">개인정보처리방침</Link>에
        동의합니다.
      </p>
    </div>
  );
}
