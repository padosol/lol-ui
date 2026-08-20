import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { parsePostSort } from "@/entities/community";
import { CommunityPageClient } from "@/views/community";
import {
  loadCategoryTree,
  loadPostsSafely,
} from "@/views/community/lib/loadCommunityData";

interface Props {
  params: Promise<{ locale: string }>;
  /** 정렬·검색어는 URL 이 출처다. 없으면 기본 정렬로 읽는다. */
  searchParams: Promise<{ sort?: string; q?: string }>;
}

/** 새 글이 곧바로 목록에 보여야 해서 요청마다 렌더한다. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.community" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/community"),
  };
}

export default async function CommunityPage({
  params,
  searchParams,
}: Readonly<Props>) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));

  const { sort, q } = await searchParams;
  const listSort = parsePostSort(sort);
  const keyword = q?.trim() ?? "";

  const [tree, posts] = await Promise.all([
    loadCategoryTree(locale),
    loadPostsSafely(undefined, listSort),
  ]);

  return (
    <CommunityPageClient
      category="ALL"
      sort={listSort}
      keyword={keyword}
      initialTree={tree}
      initialPosts={posts}
    />
  );
}
