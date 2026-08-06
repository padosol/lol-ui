import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { LeaderboardsPageClient } from "@/views/leaderboards";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.leaderboards" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/leaderboards"),
  };
}

export default async function LeaderboardsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <LeaderboardsPageClient />;
}
