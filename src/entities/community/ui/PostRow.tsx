"use client";

import { Link } from "@/shared/i18n/navigation";
import { useRelativeNow } from "@/shared/i18n";
import { useFormatter, useTranslations } from "next-intl";
import { useCategoryLabel, useCategoryTree } from "../model/useCategories";
import { postHref } from "../lib/routes";
import type { CategoryId, PostListItem, PostSort } from "../types";

interface PostRowProps {
  post: PostListItem;
  /**
   * 지금 열려 있는 글. 상세 화면 하단 목록에서 현재 위치를 표시한다.
   * (목록 화면에서는 열린 글이 없으므로 항상 false 다)
   */
  active?: boolean;
  /**
   * 이 글을 열었을 때 상세 아래 목록이 설 정렬. 목록에서 보던 순서를 그대로
   * 이어가려고 링크에 싣는다 (기본 정렬이면 붙지 않는다).
   */
  listSort?: PostSort;
  /**
   * 이 목록이 서 있는 게시판. 상세로 넘어가도 같은 목록을 이어가려고 링크에
   * 싣는다 (전체가 아니면 글에서 나오므로 붙지 않는다).
   */
  listFrom?: CategoryId | "ALL";
}

/**
 * 게시판 목록의 한 줄. 카드가 아니라 행으로 쌓아 한 화면에 더 많은 글이 보이게 한다.
 * (마이페이지 북마크 목록은 카드형 PostCard 를 그대로 쓴다)
 */
export default function PostRow({
  post,
  active = false,
  listSort,
  listFrom,
}: Readonly<PostRowProps>) {
  const format = useFormatter();
  const now = useRelativeNow();
  const t = useTranslations("community.stats");
  const categoryLabel = useCategoryLabel();
  // 라벨이 도착하기 전에는 코드 원문(GENERAL)이 나오므로 배지를 비워둔다.
  const { isLoading: isCategoryLoading } = useCategoryTree();
  const netVotes = post.upvoteCount - post.downvoteCount;

  return (
    <Link
      href={postHref(post.id, { sort: listSort, from: listFrom })}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3.5 px-4 py-3 border-b border-divider last:border-b-0 transition-colors ${
        active ? "bg-primary/10" : "hover:bg-surface-2"
      }`}
    >
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-[11.5px] font-bold text-on-surface-disabled">
            {isCategoryLoading ? "" : categoryLabel(post.categoryId)}
          </span>
          <span
            className={`min-w-0 truncate text-[15px] transition-colors ${
              active
                ? "font-bold text-primary"
                : "text-on-surface group-hover:text-primary"
            }`}
          >
            {post.title}
          </span>
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
