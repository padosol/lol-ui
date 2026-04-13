"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/features/theme-toggle";
import { useLogout } from "@/features/auth";
import { useAuthStore } from "@/entities/auth";
import { useHasHydrated } from "@/shared/lib/useHasHydrated";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useHasHydrated(useAuthStore);
  const { handleLogout } = useLogout();

  return (
    <header className="bg-surface-1 border-b border-divider">
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
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-on-surface-medium hover:text-on-surface"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
