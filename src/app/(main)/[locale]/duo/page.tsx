import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { DuoPageClient } from "@/views/duo";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.duo" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/duo"),
  };
}

export default async function DuoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <DuoPageClient />;
}
