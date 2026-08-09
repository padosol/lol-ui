import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { ChampionStatsPageClient } from "@/views/champion-stats";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.championStats" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/champion-stats"),
  };
}

export default async function ChampionStatsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <ChampionStatsPageClient />;
}
