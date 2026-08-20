"use client";

import { useTranslations } from "next-intl";
import { PostRow } from "@/entities/community";
import type { PostListItem } from "@/entities/community";

interface PostListProps {
  posts: readonly PostListItem[];
  isLoading: boolean;
  /** 비었을 때 문구. 검색 결과가 비었는지 게시판이 비었는지는 호출부가 안다. */
  emptyLabel: string;
}

/** 글 목록 카드. 게시판 목록과 상세 하단 목록이 같은 껍데기를 쓴다. */
export default function PostList({
  posts,
  isLoading,
  emptyLabel,
}: Readonly<PostListProps>) {
  const t = useTranslations("community");

  return (
    <div className="bg-surface-1 border border-divider rounded-xl overflow-hidden">
      {isLoading ? (
        <div className="py-16 text-center text-on-surface-disabled">
          {t("loading")}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-on-surface-disabled">
          {emptyLabel}
        </div>
      ) : (
        posts.map((post) => <PostRow key={post.id} post={post} />)
      )}
    </div>
  );
}
