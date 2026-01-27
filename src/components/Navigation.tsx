"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const navItems = [
    { label: "홈", href: "/" },
    { label: "랭킹", href: "/leaderboards" },
    // { label: "챔피언 분석", href: "/champion-analysis" },
  ];

  return (
    <nav className="bg-surface-1 border-b border-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center h-full gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
          {isLoggedIn && (
            <Link
              href="/mypage"
              className={`h-full flex items-center font-medium text-sm transition-colors border-b-2 ${
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
    </nav>
  );
}
