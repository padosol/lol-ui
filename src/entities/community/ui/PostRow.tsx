"use client";

import { ImageIcon } from "lucide-react";
import { Link } from "@/shared/i18n/navigation";
import { useRelativeNow } from "@/shared/i18n";
import { useFormatter, useTranslations } from "next-intl";
import { useCategoryLabel, useCategoryTree } from "../model/useCategories";
import { postHref } from "../lib/routes";
import type { PostListItem } from "../types";

interface PostRowProps {
  post: PostListItem;
}

/**
 * 게시판 목록의 한 줄. 카드가 아니라 행으로 쌓아 한 화면에 더 많은 글이 보이게 한다.
 * (마이페이지 북마크 목록은 카드형 PostCard 를 그대로 쓴다)
 */
export default function PostRow({ post }: PostRowProps) {
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
      className="group flex items-center gap-3.5 px-4 py-3 border-b border-divider last:border-b-0 hover:bg-surface-2 transition-colors"
    >
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-[11.5px] font-bold text-on-surface-disabled">
            {isCategoryLoading ? "" : categoryLabel(post.categoryId)}
          </span>
          <span className="min-w-0 truncate text-[15px] text-on-surface group-hover:text-primary transition-colors">
            {post.title}
          </span>
          {/* 제목이 길어 잘려도 아이콘은 밀려나지 않아야 한다(shrink-0). */}
          {post.hasImage && (
            <ImageIcon
              className="h-3.5 w-3.5 shrink-0 text-on-surface-disabled"
              aria-label={t("image")}
            />
          )}
          {post.commentCount > 0 && (
            <span className="shrink-0 rounded bg-primary/15 px-1.5 py-px text-xs font-bold text-primary">
              {post.commentCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 min-w-0 text-xs text-on-surface-disabled">
          <span className="truncate font-medium text-on-surface-medium">
            {post.author.nickname}
          </span>
          <span className="shrink-0">·</span>
          <span className="shrink-0">
            {format.relativeTime(new Date(post.createdAt), now)}
          </span>
          <span className="shrink-0 sm:hidden">
            · {t("upvotes")} {netVotes}
          </span>
          <span className="shrink-0 sm:hidden">
            · {t("views")} {format.number(post.viewCount)}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex shrink-0 gap-4 text-right">
        <div className="w-12">
          <div className="text-sm font-bold text-on-surface">{netVotes}</div>
          <div className="text-[11px] font-semibold text-on-surface-disabled">
            {t("upvotes")}
          </div>
        </div>
        <div className="w-14">
          <div className="text-sm text-on-surface-medium">
            {format.number(post.viewCount)}
          </div>
          <div className="text-[11px] font-semibold text-on-surface-disabled">
            {t("views")}
          </div>
        </div>
      </div>
    </Link>
  );
}
