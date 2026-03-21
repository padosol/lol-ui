"use client";

import { useAuthStore } from "@/entities/auth";
import { NicknameEditForm } from "@/features/nickname-edit";
import { Check } from "lucide-react";

export default function AccountSection() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-on-surface mb-6">기본정보</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-on-surface-medium mb-2">
              이메일
            </label>
            <div className="px-4 py-3 bg-surface-4 border border-divider rounded-lg text-on-surface-disabled text-sm">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">
              비밀번호
            </label>
            <p className="text-sm text-on-surface-disabled">
              소셜 로그인으로 가입된 계정입니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">
              닉네임
            </label>
            <NicknameEditForm currentNickname={user.nickname} />
          </div>
        </div>
      </section>

      <hr className="border-divider" />

      <section>
        <h2 className="text-lg font-bold text-on-surface mb-6">
          SNS 계정 연동하기
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-5 py-4 bg-surface-1 border border-divider rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <div>
                <span className="text-sm font-medium text-on-surface">
                  구글
                </span>
                <p className="text-xs text-on-surface-medium">{user.email}</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-sm text-success">
              <Check className="w-4 h-4" />
              로그인되었습니다.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
