import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { CommunityEditPageClient } from "@/views/community";

interface Props {
  params: Promise<{ locale: string; postId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, postId } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.communityEdit" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, `/community/${postId}/edit`),
  };
}

export default async function CommunityEditPage({ params }: Props) {
  const { postId } = await params;
  return <CommunityEditPageClient postId={Number(postId)} />;
}
