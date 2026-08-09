"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  usePostDetail,
  useDeletePost,
  useVote,
  useRemoveVote,
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
  const tCategory = useTranslations("domain.postCategory");
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

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.push("/community")}
        className="flex items-center gap-1 text-sm text-on-surface-medium hover:text-on-surface transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToList")}
      </button>

      <div className="bg-surface-1 border border-divider rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-medium">
            {tCategory(post.category)}
          </span>
          <span className="text-xs text-on-surface-disabled">
            {tPost("viewCount", { count: post.viewCount })}
          </span>
        </div>

        <h1 className="text-lg font-bold text-on-surface mb-4">
          {post.title}
        </h1>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-on-surface">
              {post.author.nickname}
            </span>
            <span className="text-xs text-on-surface-disabled">
              {format.dateTime(new Date(post.createdAt), { dateStyle: "long", timeStyle: "short" })}
            </span>
            {post.updatedAt !== post.createdAt && (
              <span className="text-xs text-on-surface-disabled">
                {tPost("edited")}
              </span>
            )}
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/community/${post.id}/edit`)}
                className="flex items-center gap-1 text-xs text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                {tCommon("edit")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 text-xs text-on-surface-disabled hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {tCommon("delete")}
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-on-surface-medium leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </div>

        <div className="flex items-center justify-between gap-4">
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
        </div>
      </div>

      <div className="bg-surface-1 border border-divider rounded-lg p-6">
        <CommentSection postId={post.id} commentCount={post.commentCount} />
      </div>

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
