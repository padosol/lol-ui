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
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium text-sm transition-colors pb-1 border-b-2 ${
                    isActive
                      ? "text-blue-500 border-blue-500"
                      : "text-gray-300 hover:text-blue-500 border-transparent"
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
              className={`font-medium text-sm transition-colors pb-1 border-b-2 ${
                pathname === "/mypage"
                  ? "text-blue-500 border-blue-500"
                  : "text-gray-300 hover:text-blue-500 border-transparent"
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
