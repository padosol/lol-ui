"use client";

import Link from "next/link";
import { ThemeToggle } from "@/features/theme-toggle";
import { useLogout } from "@/features/auth";
import { useAuthStore } from "@/entities/auth";

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const { handleLogout } = useLogout();

  return (
    <header className="bg-surface-1 border-b border-divider">
      {/* 상단 헤더 */}
      <div className="bg-[#272727] border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[40px] text-sm">
            <div className="flex items-center gap-4">
              <button className="text-white/60 hover:text-white/87">
                리그 오브 레전드
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <>
                  <span className="text-on-surface-medium">
                    {user.nickname}
                  </span>
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
