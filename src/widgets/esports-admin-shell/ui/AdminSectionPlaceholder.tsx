"use client";

import { useTranslations } from "next-intl";

export type AdminSection = "leagues" | "teams" | "persons" | "rosterIssues";

/** 아직 만들지 않은 관리자 화면 자리. 각 이슈가 자기 페이지에서 이 컴포넌트를 실제 화면으로 바꾼다. */
export default function AdminSectionPlaceholder({ section }: Readonly<{ section: AdminSection }>) {
  const t = useTranslations("esportsAdmin");

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-on-surface">{t(`${section}.title`)}</h2>
      <p className="text-sm text-on-surface-medium">{t("comingSoon")}</p>
    </section>
  );
}
