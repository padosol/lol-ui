"use client";

import { Fragment, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PostListItem, PostListResponse } from "@/entities/community";
import { useTranslations } from "next-intl";

interface MypagePostListProps {
  /** title·loadError·loading·empty·emptyPage·previous·next 를 가진 메시지 묶음. */
  namespace: "mypage.posts" | "mypage.bookmarks";
  page: number;
  onPageChange: (page: number) => void;
  query: Pick<
    UseQueryResult<PostListResponse, Error>,
    "data" | "isLoading" | "isError" | "isFetching" | "refetch"
  >;
  renderPost: (post: PostListItem) => ReactNode;
}

/**
 * 마이페이지의 페이지 단위 글 목록(내가 쓴 글·북마크). 로딩·실패·빈 상태와 이전/다음 이동이 같고
 * 글 한 줄을 어떻게 그릴지만 탭마다 다르다.
 */
export default function MypagePostList({
  namespace,
  page,
  onPageChange,
  query,
  renderPost,
}: MypagePostListProps) {
  const t = useTranslations(namespace);
  const tCommon = useTranslations("common");
  const { data, isLoading, isError, isFetching, refetch } = query;
  const posts = data?.content ?? [];

  return (
    <section>
      <h2 className="text-lg font-bold text-on-surface mb-6">{t("title")}</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-1 border border-divider rounded-lg p-4 animate-pulse h-[92px]"
            />
          ))}
        </div>
      ) : isError ? (
        /* 실패를 빈 목록으로 보여주면 글이 전부 날아간 것처럼 읽힌다. */
        <div className="text-center py-16">
          <p className="text-on-surface-medium mb-4">
            {t("loadError")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-4 border border-divider text-on-surface hover:bg-surface-8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isFetching ? t("loading") : tCommon("retry")}
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-on-surface-disabled">
          {page === 0 ? t("empty") : t("emptyPage")}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Fragment key={post.id}>{renderPost(post)}</Fragment>
          ))}
        </div>
      )}

      {!isError && (page > 0 || data?.hasNext) && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0 || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t("previous")}
          </button>
          <span className="text-sm text-on-surface-disabled px-2">{page + 1}</span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!data?.hasNext || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t("next")}
          </button>
        </div>
      )}
    </section>
  );
}
