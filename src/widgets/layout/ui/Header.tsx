"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/features/theme-toggle";
import { LocaleSwitcher } from "@/features/locale-switcher";
import { useLogout } from "@/features/auth";
import { useAuthStore } from "@/entities/auth";
import { useHasHydrated } from "@/shared/lib/useHasHydrated";

export default function Header() {
  const t = useTranslations("nav");
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useHasHydrated(useAuthStore);
  const { handleLogout } = useLogout();

  // Navigation 이 sticky z-50 이라 z-index 가 같으면 DOM 순서상 뒤에 오는
  // Navigation 이 위로 올라가 헤더의 드롭다운(언어 선택)을 가린다.
  // 헤더를 한 단계 위 레이어로 올려 드롭다운이 항상 보이게 한다.
  return (
    <header className="relative z-[60] bg-surface-1 border-b border-divider">
      {/* 상단 헤더 */}
      <div className="bg-[#272727] border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[40px] text-sm">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/main_logo.png"
                  alt="METAPICK"
                  width={120}
                  height={28}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <ThemeToggle />
              {!hasHydrated ? null : user ? (
                <>
                  <Link
                    href="/mypage"
                    className="text-on-surface-medium hover:text-on-surface"
                  >
                    {user.nickname}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-on-surface-medium hover:text-on-surface"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-on-surface-medium hover:text-on-surface"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
