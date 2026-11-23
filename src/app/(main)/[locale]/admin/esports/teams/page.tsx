import { setRequestLocale } from "next-intl/server";
import { toLocale } from "@/shared/i18n/locale";
import { AdminSectionPlaceholder } from "@/widgets/esports-admin-shell";

interface Props {
  params: Promise<{ locale: string }>;
}

/** 팀 관리(개명·해체·상위 팀 포함). MP-189 가 이 파일을 실제 화면으로 바꾼다. */
export default async function EsportsAdminTeamsPage({ params }: Readonly<Props>) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <AdminSectionPlaceholder section="teams" />;
}
