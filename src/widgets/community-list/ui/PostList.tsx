"use client";

import { useTranslations } from "next-intl";
import { PostRow } from "@/entities/community";
import type { PostListItem, PostSort } from "@/entities/community";

interface PostListProps {
  posts: readonly PostListItem[];
  isLoading: boolean;
  /** 비었을 때 문구. 검색 결과가 비었는지 게시판이 비었는지는 호출부가 안다. */
  emptyLabel: string;
  /** 상세 화면 하단 목록에서 지금 열려 있는 글을 표시한다. */
  activePostId?: number;
  /** 지금 보고 있는 정렬. 글 링크에 실어 상세 아래 목록도 같은 순서로 세운다. */
  listSort?: PostSort;
}

/** 글 목록 카드. 게시판 목록과 상세 하단 목록이 같은 껍데기를 쓴다. */
export default function PostList({
  posts,
  isLoading,
  emptyLabel,
  activePostId,
  listSort,
}: Readonly<PostListProps>) {
  const t = useTranslations("community");

  // 목록 자리에 글 대신 들어갈 문구. 먼저 정해두면 아래 분기가 하나로 끝난다.
  let notice: string | null = null;
  if (isLoading) notice = t("loading");
  else if (posts.length === 0) notice = emptyLabel;

  return (
    <div className="bg-surface-1 border border-divider rounded-xl overflow-hidden">
      {notice === null ? (
        posts.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            active={post.id === activePostId}
            listSort={listSort}
          />
        ))
      ) : (
        <div className="py-16 text-center text-on-surface-disabled">
          {notice}
        </div>
      )}
    </div>
  );
}
