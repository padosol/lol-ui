"use client";

import { useState } from "react";
import { BookmarkX } from "lucide-react";
import { PostCard, useMyBookmarks, useRemoveBookmark } from "@/entities/community";
import { toast } from "@/shared/ui/toast";
import { useTranslations } from "next-intl";

export default function BookmarksSection() {
  const t = useTranslations("mypage.bookmarks");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, isFetching, refetch } = useMyBookmarks(page);
  const removeMutation = useRemoveBookmark();
  const posts = data?.content ?? [];

  const handleRemove = (postId: number) => {
    removeMutation.mutate(postId, {
      onError: () => toast.error(t("removeError")),
    });
  };

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
        /* 실패를 빈 목록으로 보여주면 북마크가 전부 날아간 것처럼 읽힌다. */
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
            /* 해제 버튼은 PostCard(<Link>) 안이 아니라 형제로 둔다.
               링크 안에 버튼을 중첩하면 클릭이 서로 먹고 stopPropagation 에 의존하게 된다. */
            <div key={post.id} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <PostCard post={post} />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(post.id)}
                disabled={removeMutation.isPending}
                aria-label={t("remove")}
                title={t("remove")}
                className="shrink-0 p-2 mt-1 rounded-md text-on-surface-disabled hover:text-error hover:bg-surface-4 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <BookmarkX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isError && (page > 0 || data?.hasNext) && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {t("previous")}
          </button>
          <span className="text-sm text-on-surface-disabled px-2">{page + 1}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
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
