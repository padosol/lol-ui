"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Share2 } from "lucide-react";
import {
  usePostDetail,
  useDeletePost,
  useVote,
  useRemoveVote,
  useCategoryLabel,
  AuthorAvatar,
  postEditHref,
} from "@/entities/community";
import type { VoteType } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { VoteButtons } from "@/shared/ui/vote-buttons";
import { BookmarkButton } from "@/features/community-bookmark";
import { ConfirmModal } from "@/shared/ui/modal";
import { toast } from "@/shared/ui/toast";
import { useFormatter, useTranslations } from "next-intl";
import CommentSection from "./CommentSection";

interface PostDetailPanelProps {
  postId: number;
}

export default function PostDetailPanel({ postId }: PostDetailPanelProps) {
  const format = useFormatter();
  const t = useTranslations("community");
  const tPost = useTranslations("community.post");
  const tCommon = useTranslations("common");
  // 게시글 본문 로딩이 보통 더 오래 걸려 라벨은 그 전에 도착한다. 목록과 달리
  // 뒤로가기 버튼이 비면 화살표만 남으므로 빈 문자열 처리를 하지 않는다.
  const categoryLabel = useCategoryLabel();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: post, isLoading, error } = usePostDetail(postId);
  const deleteMutation = useDeletePost();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const voteMutation = useVote(postId);
  const removeVoteMutation = useRemoveVote(postId);

  const isAuthor = user?.id === post?.author.id;
  const isVotePending = voteMutation.isPending || removeVoteMutation.isPending;

  const handleVote = (voteType: VoteType) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!post) return;

    if (post.currentUserVote === voteType) {
      removeVoteMutation.mutate({ targetType: "POST", targetId: post.id });
    } else {
      voteMutation.mutate({ targetType: "POST", targetId: post.id, voteType });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("shareCopied"));
    } catch {
      toast.error(t("shareError"));
    }
  };

  const confirmDelete = () => {
    if (!post) return;
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push("/community");
      },
      onError: () => toast.error(tPost("deleteError")),
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        {t("loading")}
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        {tPost("notFound")}
      </div>
    );
  }

  const netVotes = post.upvoteCount - post.downvoteCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/community")}
          className="flex items-center gap-1.5 text-[13.5px] font-bold text-on-surface-medium hover:text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {categoryLabel(post.categoryId)}
        </button>

        <div className="flex-1" />

        {isAuthor && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => router.push(postEditHref(post.id))}
              className="flex items-center gap-1 rounded-md border border-divider px-3 py-1.5 text-[13px] font-bold text-on-surface-medium hover:text-on-surface hover:border-on-surface-disabled transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              {tCommon("edit")}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1 rounded-md border border-divider px-3 py-1.5 text-[13px] font-bold text-on-surface-medium hover:text-loss hover:border-loss/50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {tCommon("delete")}
            </button>
          </div>
        )}
      </div>

      <article className="bg-surface-1 border border-divider rounded-xl px-5 py-6 sm:px-8 sm:py-7">
        <div className="mb-3">
          <span className="rounded bg-primary/15 px-2 py-1 text-[11.5px] font-bold text-primary">
            {categoryLabel(post.categoryId)}
          </span>
        </div>

        <h1 className="mb-4 text-xl sm:text-[26px] font-bold leading-snug tracking-tight text-on-surface">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2.5 border-b border-divider pb-4">
          <AuthorAvatar nickname={post.author.nickname} />
          <span className="text-sm font-bold text-on-surface">
            {post.author.nickname}
          </span>
          <div className="flex-1" />
          <span className="text-xs text-on-surface-disabled">
            {format.dateTime(new Date(post.createdAt), {
              dateStyle: "long",
              timeStyle: "short",
            })}
            {post.updatedAt !== post.createdAt && ` ${tPost("edited")}`}
            {" · "}
            {tPost("viewCount", { count: post.viewCount })}
            {" · "}
            {tPost("upvoteCount", { count: netVotes })}
          </span>
        </div>

        <div className="py-6 text-[15px] leading-[1.85] text-on-surface-medium whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-4">
          <VoteButtons
            upvoteCount={post.upvoteCount}
            downvoteCount={post.downvoteCount}
            currentUserVote={post.currentUserVote}
            onVote={handleVote}
            isPending={isVotePending}
          />
          <BookmarkButton
            postId={post.id}
            bookmarked={post.currentUserBookmarked}
          />
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 rounded-md border border-divider bg-surface-4 hover:bg-surface-8 px-3 py-1.5 text-sm font-medium text-on-surface-medium transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {t("share")}
          </button>
        </div>
      </article>

      <CommentSection postId={post.id} commentCount={post.commentCount} />

      <button
        type="button"
        onClick={() => router.push("/community")}
        className="mt-2 mb-4 w-full rounded-lg bg-surface-4 hover:bg-surface-8 py-3 text-[13.5px] font-bold text-on-surface-medium hover:text-on-surface transition-colors cursor-pointer"
      >
        {t("backToList")}
      </button>

      <ConfirmModal
        open={deleteOpen}
        title={tPost("deleteTitle")}
        description={tPost("deleteDescription")}
        confirmLabel={tCommon("delete")}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
