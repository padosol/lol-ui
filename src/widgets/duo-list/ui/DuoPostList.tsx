"use client";

import type { DuoPost } from "@/entities/duo";
import DuoCard from "./DuoCard";

interface DuoPostListProps {
  posts: DuoPost[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onSelectPost: (postId: number) => void;
}

export default function DuoPostList({
  posts,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onSelectPost,
}: DuoPostListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-1 border border-divider rounded-lg p-4 animate-pulse h-[140px]"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        등록된 듀오가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <DuoCard key={post.id} post={post} onSelect={onSelectPost} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onFetchNextPage}
            disabled={isFetchingNextPage}
            className="px-6 py-2 text-sm font-medium text-on-surface-medium bg-surface-4 border border-divider rounded-md hover:bg-surface-8 transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
