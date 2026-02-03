"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  // TODO: 로그인 기능 구현 시 아래 주석 해제
  // const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <header className="bg-surface-1 border-b border-divider">
      {/* 상단 헤더 */}
      <div className="bg-[#272727] border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-4">
              <button className="text-white/60 hover:text-white/87">
                리그 오브 레전드
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* {isLoggedIn ? (
                <Link
                  href="/mypage"
                  className="text-on-surface-medium hover:text-on-surface"
                >
                  마이페이지
                </Link>
              ) : (
                <button className="text-on-surface-medium hover:text-on-surface">
                  로그인
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
