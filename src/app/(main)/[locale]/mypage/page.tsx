import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { MypageClient } from "@/views/mypage";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.mypage" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/mypage"),
  };
}

export default async function MypagePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <MypageClient />;
}
