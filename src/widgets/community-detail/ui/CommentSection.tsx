"use client";

import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useVote,
  useRemoveVote,
} from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { CommentForm, CommentItem } from "@/features/community-comment";
import { ConfirmModal } from "@/shared/ui/modal";
import { toast } from "@/shared/ui/toast";
import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface CommentSectionProps {
  postId: number;
  commentCount: number;
}

export default function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const t = useTranslations("community.comment");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: comments, isLoading } = useComments(postId);
  const createMutation = useCreateComment(postId);
  const updateMutation = useUpdateComment(postId);
  const deleteMutation = useDeleteComment(postId);
  const voteMutation = useVote(postId);
  const removeVoteMutation = useRemoveVote(postId);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleCreate = (content: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    createMutation.mutate({ content, parentCommentId: null });
  };

  const handleReply = (content: string, parentCommentId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }
    createMutation.mutate({ content, parentCommentId });
  };

  const handleUpdate = (commentId: number, content: string) => {
    updateMutation.mutate({ commentId, data: { content } });
  };

  const handleDelete = (commentId: number) => {
    setPendingDeleteId(commentId);
  };

  const confirmDelete = () => {
    if (pendingDeleteId === null) return;
    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => setPendingDeleteId(null),
      onError: () => toast.error(t("deleteError")),
    });
  };

  const handleVote = (targetId: number, voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!user) {
      router.push("/login");
      return;
    }
    voteMutation.mutate({ targetType: "COMMENT", targetId, voteType });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-on-surface">
        {t("count", { count: commentCount })}
      </h3>

      <CommentForm
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        placeholder={user ? t("placeholder") : t("loginRequired")}
      />

      {isLoading ? (
        <div className="text-center py-8 text-on-surface-disabled text-sm">
          {t("loading")}
        </div>
      ) : comments && comments.length > 0 ? (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onVote={handleVote}
              isReplyPending={createMutation.isPending}
              isUpdatePending={updateMutation.isPending}
              isVotePending={voteMutation.isPending || removeVoteMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-on-surface-disabled text-sm">
          {t("empty")}
        </div>
      )}

      <ConfirmModal
        open={pendingDeleteId !== null}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={tCommon("delete")}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
