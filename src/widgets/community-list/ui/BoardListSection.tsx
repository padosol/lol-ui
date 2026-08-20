"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePosts, useCategoryLabel, categoryHref } from "@/entities/community";
import type { CategoryId, PostPeriod, PostSort } from "@/entities/community";
import PostList from "./PostList";
import LoadMoreButton from "./LoadMoreButton";

/**
 * 상세 화면 하단 목록의 조회 조건. 목록 화면과 같은 값을 써야 쿼리 키가 겹쳐
 * 목록 → 상세 이동에서 이미 받아둔 페이지를 그대로 쓴다.
 */
const SECTION_SORT: PostSort = "HOT";
const SECTION_PERIOD: PostPeriod = "ALL";

interface BoardListSectionProps {
  /** 글이 속한 게시판. 상세 화면이 SSR 로 이미 알고 있는 값이다. */
  categoryId: CategoryId;
  /** 지금 열려 있는 글. 목록에서 현재 위치로 표시된다. */
  currentPostId: number;
}

/**
 * 게시글 본문 아래에 이어 붙는 같은 게시판의 글 목록.
 *
 * 글을 다 읽고 나서 목록으로 되돌아가지 않아도 다음 글로 넘어갈 수 있게 한다.
 * 첫 페이지는 서버에서 받지 않는다 — 상세 SSR 에 목록 왕복을 더하면 TTFB 만
 * 늘고, 상세마다 같은 링크가 반복되는 편은 색인에도 득이 없다.
 */
export default function BoardListSection({
  categoryId,
  currentPostId,
}: Readonly<BoardListSectionProps>) {
  const t = useTranslations("community");
  const categoryLabel = useCategoryLabel();

  const postsQuery = usePosts({
    categoryId,
    sort: SECTION_SORT,
    period: SECTION_PERIOD,
  });

  const posts =
    postsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <section className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[15px] font-bold text-on-surface">
          {t("otherPosts")}
        </h2>

        <div className="flex-1" />

        <Link
          href={categoryHref(categoryId)}
          className="flex items-center gap-0.5 text-[13px] font-bold text-on-surface-medium hover:text-primary transition-colors"
        >
          {categoryLabel(categoryId) || t("allCategories")}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <PostList
        posts={posts}
        isLoading={postsQuery.isLoading}
        emptyLabel={t("empty")}
        activePostId={currentPostId}
      />

      {postsQuery.hasNextPage && (
        <LoadMoreButton
          onClick={() => postsQuery.fetchNextPage()}
          isLoading={postsQuery.isFetchingNextPage}
        />
      )}
    </section>
  );
}
