import { setRequestLocale } from "next-intl/server";
import { toLocale } from "@/shared/i18n/locale";
import { AdminSectionPlaceholder } from "@/widgets/esports-admin-shell";

interface Props {
  params: Promise<{ locale: string }>;
}

/** 리그·시즌 관리. MP-189 가 이 파일을 실제 화면으로 바꾼다. */
export default async function EsportsAdminLeaguesPage({ params }: Readonly<Props>) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <AdminSectionPlaceholder section="leagues" />;
}
