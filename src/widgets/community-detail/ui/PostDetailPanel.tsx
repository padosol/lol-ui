"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  usePostDetail,
  useDeletePost,
  useVote,
  useRemoveVote,
  POST_CATEGORY_LABELS,
} from "@/entities/community";
import type { VoteType } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { VoteButtons } from "@/shared/ui/vote-buttons";
import { formatDate } from "@/shared/lib/date";
import CommentSection from "./CommentSection";

interface PostDetailPanelProps {
  postId: number;
}

export default function PostDetailPanel({ postId }: PostDetailPanelProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: post, isLoading, error } = usePostDetail(postId);
  const deleteMutation = useDeletePost();
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

  const handleDelete = () => {
    if (!post) return;
    if (confirm("게시글을 삭제하시겠습니까?")) {
      deleteMutation.mutate(post.id, {
        onSuccess: () => router.push("/community"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        로딩 중...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        게시글을 찾을 수 없습니다.
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
        목록으로
      </button>

      <div className="bg-surface-1 border border-divider rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-medium">
            {POST_CATEGORY_LABELS[post.category]}
          </span>
          <span className="text-xs text-on-surface-disabled">
            조회 {post.viewCount}
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
              {formatDate(post.createdAt, { withTime: true })}
            </span>
            {post.updatedAt !== post.createdAt && (
              <span className="text-xs text-on-surface-disabled">(수정됨)</span>
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
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1 text-xs text-on-surface-disabled hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-on-surface-medium leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </div>

        <div className="flex justify-center">
          <VoteButtons
            upvoteCount={post.upvoteCount}
            downvoteCount={post.downvoteCount}
            currentUserVote={post.currentUserVote}
            onVote={handleVote}
            isPending={isVotePending}
          />
        </div>
      </div>

      <div className="bg-surface-1 border border-divider rounded-lg p-6">
        <CommentSection postId={post.id} commentCount={post.commentCount} />
      </div>
    </div>
  );
}
