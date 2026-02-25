"use client";

import SearchBar from "@/components/search/SearchBar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isHome = pathname === "/";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navItems = [
    { label: "홈", href: "/" },
    { label: "챔피언통계", href: "/champion-stats" },
    { label: "랭킹", href: "/leaderboards" },
    { label: "패치노트", href: "/patch-notes" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface-1 border-b border-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 gap-4">
          <div className="flex items-center h-full gap-6 shrink-0">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
                    isActive
                      ? "text-primary border-primary"
                      : "text-on-surface-medium hover:text-primary border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center h-full gap-4">
            {/* 데스크탑: 인라인 컴팩트 검색 바 */}
            {!isHome && (
              <div className="hidden sm:flex items-center">
                <SearchBar variant="compact" />
              </div>
            )}

            {/* 모바일: 검색 아이콘 토글 */}
            {!isHome && (
              <button
                type="button"
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="sm:hidden flex items-center justify-center text-on-surface-medium hover:text-primary transition-colors"
                aria-label="검색"
              >
                {mobileSearchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            )}

            {isLoggedIn && (
              <Link
                href="/mypage"
                className={`h-full flex items-center font-medium text-sm transition-colors border-b-2 shrink-0 ${
                  pathname === "/mypage"
                    ? "text-primary border-primary"
                    : "text-on-surface-medium hover:text-primary border-transparent"
                }`}
              >
                마이페이지
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 모바일: 확장 검색 바 */}
      {!isHome && mobileSearchOpen && (
        <div className="sm:hidden border-t border-divider px-4 py-2">
          <SearchBar variant="compact" />
        </div>
      )}
    </nav>
  );
}
