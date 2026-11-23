"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { adminEsportsHref } from "@/entities/esports";
import { AdminGuard } from "@/features/admin-access";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { Footer, Header, Navigation } from "@/widgets/layout";

/** 관리자 메뉴. 화면을 만드는 이슈는 자기 페이지 파일만 바꾸고 여기는 건드리지 않는다. */
const ADMIN_NAV = [
  { key: "leagues", href: adminEsportsHref.leagues },
  { key: "teams", href: adminEsportsHref.teams },
  { key: "persons", href: adminEsportsHref.persons },
  { key: "rosterIssues", href: adminEsportsHref.rosterIssues },
] as const;

/** e스포츠 관리자 화면 틀: 공통 헤더 + 권한 확인 + 관리자 메뉴. */
export default function EsportsAdminShell({ children }: Readonly<{ children: ReactNode }>) {
  const t = useTranslations("esportsAdmin");
  const pathname = usePathname() ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <Navigation />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <AdminGuard>
          <h1 className="mb-6 text-2xl font-bold text-on-surface">{t("title")}</h1>
          <nav aria-label={t("title")} className="mb-6 flex gap-6 overflow-x-auto border-b border-divider">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-medium hover:text-primary"
                  }`}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
          {children}
        </AdminGuard>
      </main>
      <Footer />
    </div>
  );
}
