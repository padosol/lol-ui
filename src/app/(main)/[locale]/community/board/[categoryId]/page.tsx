import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { findCategoryBySlug } from "@/entities/community";
import { CommunityPageClient } from "@/views/community";
import {
  loadCategoryTree,
  loadPostsSafely,
} from "@/views/community/lib/loadCommunityData";

interface Props {
  params: Promise<{ locale: string; categoryId: string }>;
}

/** 새 글이 곧바로 목록에 보여야 해서 요청마다 렌더한다. */
export const dynamic = "force-dynamic";

/**
 * 게시판 목록이 DB 에 있어 URL 만으로는 유효한지 알 수 없다. 트리를 받아
 * 대조하고 없는 슬러그면 404 로 떨어뜨린다 — 존재하지 않는 게시판이
 * 빈 목록으로 200 을 돌려주면 색인만 지저분해진다.
 */
async function resolveCategory(locale: string, categoryId: string) {
  const tree = await loadCategoryTree(locale);
  const category = findCategoryBySlug(tree, categoryId);
  if (!category) notFound();
  return { tree, category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categoryId } = await params;
  const { category } = await resolveCategory(locale, categoryId);
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.community" });

  return {
    title: `${category.name} | ${t("title")}`,
    description: category.description ?? t("description"),
    alternates: localeAlternates(locale, `/community/board/${categoryId}`),
  };
}

export default async function CommunityBoardPage({ params }: Props) {
  const { locale, categoryId } = await params;
  setRequestLocale(toLocale(locale));

  const { tree, category } = await resolveCategory(locale, categoryId);
  const posts = await loadPostsSafely(category.code);

  return (
    <CommunityPageClient
      category={category.code}
      initialTree={tree}
      initialPosts={posts}
    />
  );
}
