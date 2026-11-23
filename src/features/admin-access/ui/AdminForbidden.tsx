"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";

/**
 * 관리자 권한 없음. 일반 회원이 관리자 주소로 직접 들어왔거나, 관리자 API 가 401·403 을 줬을 때 보여준다.
 * 관리자 화면에서 쿼리가 `isAdminAccessDenied(error)` 이면 이 화면을 그린다.
 */
export default function AdminForbidden() {
  const t = useTranslations("esportsAdmin.forbidden");

  return (
    <section className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <ShieldAlert className="h-10 w-10 text-on-surface-medium" aria-hidden />
      <h2 className="text-lg font-bold text-on-surface">{t("title")}</h2>
      <p className="max-w-md text-sm text-on-surface-medium">{t("description")}</p>
      <Link href="/" className="mt-2 text-sm font-medium text-primary hover:underline">
        {t("home")}
      </Link>
    </section>
  );
}
