"use client";

import type { PostListItem } from "../types";
import { Eye, ImageIcon, MessageSquare, ThumbsUp } from "lucide-react";
import { Link } from "@/shared/i18n/navigation";
import { useRelativeNow } from "@/shared/i18n";
import { useFormatter, useTranslations } from "next-intl";
import { useCategoryLabel, useCategoryTree } from "../model/useCategories";
import { postHref } from "../lib/routes";

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const format = useFormatter();
  const now = useRelativeNow();
  const t = useTranslations("community.stats");
  const categoryLabel = useCategoryLabel();
  // 라벨이 도착하기 전에는 코드 원문(GENERAL)이 나오므로 배지를 비워둔다.
  const { isLoading: isCategoryLoading } = useCategoryTree();
  const netVotes = post.upvoteCount - post.downvoteCount;

  return (
    <Link
      href={postHref(post.id)}
      className="block bg-surface-1 border border-divider rounded-lg p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-medium">
          {isCategoryLoading ? "" : categoryLabel(post.categoryId)}
        </span>
        <span className="text-xs text-on-surface-disabled">
          {format.relativeTime(new Date(post.createdAt), now)}
        </span>
        {/*
          제목 옆이 아니라 이 줄에 두는 이유: 제목은 line-clamp 로 잘리는 블록이라
          긴 제목에서는 아이콘까지 함께 잘린다.
        */}
        {post.hasImage && (
          <ImageIcon
            className="h-3.5 w-3.5 text-on-surface-disabled"
            aria-label={t("image")}
          />
        )}
      </div>

      <h3 className="text-sm font-medium text-on-surface mb-3 line-clamp-1">
        {post.title}
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-disabled">
          {post.author.nickname}
        </span>
        <div className="flex items-center gap-3 text-xs text-on-surface-disabled">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {netVotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
