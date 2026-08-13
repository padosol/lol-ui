import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { CommunityEditPageClient } from "@/views/community";

interface Props {
  params: Promise<{ locale: string; contentId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, contentId } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.communityEdit" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(
      locale,
      `/community/board/detail/${contentId}/edit`
    ),
  };
}

export default async function CommunityEditPage({ params }: Props) {
  const { contentId } = await params;

  const postId = Number(contentId);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  return <CommunityEditPageClient postId={postId} />;
}
