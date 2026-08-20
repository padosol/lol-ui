"use client";

import { useTranslations } from "next-intl";
import { usePosts } from "@/entities/community";
import type { CategoryId, PostPeriod, PostSort } from "@/entities/community";
import PostList from "./PostList";
import LoadMoreButton from "./LoadMoreButton";

/** 기간 필터는 목록 화면과 마찬가지로 화면에 없다. */
const SECTION_PERIOD: PostPeriod = "ALL";

interface BoardListSectionProps {
  /**
   * 이어 붙일 목록의 게시판. 전체에서 들어왔으면 "ALL", 아니면 글이 속한
   * 게시판이다 — 상세 화면이 URL 과 글에서 이미 알고 있는 값이다.
   */
  board: CategoryId | "ALL";
  /** 지금 열려 있는 글. 목록에서 현재 위치로 표시된다. */
  currentPostId: number;
  /**
   * 목록에서 이 글을 열 때의 정렬(URL 의 `?sort=`). 같은 순서로 세워야 방금
   * 보던 흐름이 이어지고, 조회 조건이 같아 목록 화면이 받아둔 페이지도 쓴다.
   */
  sort: PostSort;
}

/**
 * 게시글 본문 아래에 이어 붙는 목록 — 방금 보던 그 목록이다.
 *
 * 글을 다 읽고 나서 목록으로 되돌아가지 않아도 다음 글로 넘어갈 수 있게 한다.
 * 첫 페이지는 서버에서 받지 않는다 — 상세 SSR 에 목록 왕복을 더하면 TTFB 만
 * 늘고, 상세마다 같은 링크가 반복되는 편은 색인에도 득이 없다.
 */
export default function BoardListSection({
  board,
  currentPostId,
  sort,
}: Readonly<BoardListSectionProps>) {
  const t = useTranslations("community");

  const postsQuery = usePosts({
    // 전체는 게시판 조건 없이 조회한다. 목록 화면과 조회 키가 같아 그쪽에서
    // 이미 받아둔 페이지를 그대로 쓴다.
    categoryId: board === "ALL" ? undefined : board,
    sort,
    period: SECTION_PERIOD,
  });

  const posts =
    postsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <section className="mt-4 flex flex-col gap-3">
      <PostList
        posts={posts}
        isLoading={postsQuery.isLoading}
        emptyLabel={t("empty")}
        activePostId={currentPostId}
        listSort={sort}
        listFrom={board}
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
