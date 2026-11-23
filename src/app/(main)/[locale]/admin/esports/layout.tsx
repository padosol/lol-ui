import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { toLocale } from "@/shared/i18n/locale";
import { EsportsAdminShell } from "@/widgets/esports-admin-shell";

interface Params {
  params: Promise<{ locale: string }>;
}

/** 관리자 화면은 검색에 노출하지 않는다(사이트맵에도 넣지 않는다). */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.esportsAdmin" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

/** 관리자 화면은 CSR·쿠키 인증이다. 권한 확인은 EsportsAdminShell 의 AdminGuard 가 한다. */
export default async function EsportsAdminLayout({
  children,
  params,
}: Readonly<Params & { children: ReactNode }>) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <EsportsAdminShell>{children}</EsportsAdminShell>;
}
