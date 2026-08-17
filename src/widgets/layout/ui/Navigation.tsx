"use client";

import { SearchBar } from "@/features/summoner-search";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { usePathname } from "@/shared/i18n/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  // { key: "championStats", href: "/champion-stats" },
  { key: "leaderboards", href: "/leaderboards" },
  // { key: "patchNotes", href: "/patch-notes" },
  { key: "community", href: "/community" },
  { key: "duo", href: "/duo" },
] as const;

export default function Navigation() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface-1 border-b border-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[50px] gap-4">
          <div className="flex items-center h-full gap-4 sm:gap-6 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-full flex items-center font-medium text-sm transition-colors border-b-2 whitespace-nowrap shrink-0 ${isActive
                    ? "text-primary border-primary"
                    : "text-on-surface-medium hover:text-primary border-transparent"
                    }`}
                >
                  {t(item.key)}
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
                aria-label={tCommon("search")}
              >
                {mobileSearchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
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
