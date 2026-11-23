import { adminEsportsHref } from "@/entities/esports";
import { redirect } from "@/shared/i18n/navigation";
import { toLocale } from "@/shared/i18n/locale";

interface Props {
  params: Promise<{ locale: string }>;
}

/** 관리자 첫 화면은 리그·시즌 관리다. */
export default async function EsportsAdminIndexPage({ params }: Readonly<Props>) {
  const { locale } = await params;
  redirect({ href: adminEsportsHref.leagues, locale: toLocale(locale) });
}
