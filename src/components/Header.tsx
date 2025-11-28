"use client";

import { useAuthStore } from "@/stores/useAuthStore";

export default function Header() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      {/* 상단 헤더 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-4">
              <button className="text-gray-300 hover:text-white">
                리그 오브 레전드
              </button>
            </div>
            {/* <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/mypage"
                  className="text-gray-300 hover:text-white"
                >
                  마이페이지
                </Link>
              ) : (
                <button className="text-gray-300 hover:text-white">
                  로그인
                </button>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
}
