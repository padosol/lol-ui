import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { TermsOfServicePageClient } from "@/views/terms-of-service";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.terms" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/terms-of-service"),
  };
}

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  return <TermsOfServicePageClient />;
}
