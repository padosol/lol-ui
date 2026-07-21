"use client";

import { useState } from "react";
import { useMyBookmarks } from "@/entities/community";
import { PostCard } from "@/widgets/community-list";

export default function BookmarksSection() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = useMyBookmarks(page);
  const posts = data?.content ?? [];

  return (
    <section>
      <h2 className="text-lg font-bold text-on-surface mb-6">북마크한 글</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-1 border border-divider rounded-lg p-4 animate-pulse h-[92px]"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-on-surface-disabled">
          {page === 0
            ? "북마크한 글이 없습니다"
            : "이 페이지에는 글이 없습니다"}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {(page > 0 || data?.hasNext) && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            이전
          </button>
          <span className="text-sm text-on-surface-disabled px-2">
            {page + 1}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasNext || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50 cursor-pointer"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
}
