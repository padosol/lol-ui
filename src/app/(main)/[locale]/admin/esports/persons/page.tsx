import { setRequestLocale } from "next-intl/server";
import { toLocale } from "@/shared/i18n/locale";
import { AdminSectionPlaceholder } from "@/widgets/esports-admin-shell";

interface Props {
  params: Promise<{ locale: string }>;
}

/**
 * 인물 검색·등록. MP-190 이 이 파일을 실제 화면으로 바꾼다.
 * 인물 상세는 persons/[personId] (MP-190), 계약 사건 입력·정정은 persons/[personId]/contracts (MP-191) 에 둔다.
 */
export default async function EsportsAdminPersonsPage({ params }: Readonly<Props>) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <AdminSectionPlaceholder section="persons" />;
}
