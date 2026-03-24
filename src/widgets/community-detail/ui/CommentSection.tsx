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
import { useRouter } from "next/navigation";

interface CommentSectionProps {
  postId: number;
  commentCount: number;
}

export default function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: comments, isLoading } = useComments(postId);
  const createMutation = useCreateComment(postId);
  const updateMutation = useUpdateComment(postId);
  const deleteMutation = useDeleteComment(postId);
  const voteMutation = useVote(postId);
  const removeVoteMutation = useRemoveVote(postId);

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
    if (confirm("댓글을 삭제하시겠습니까?")) {
      deleteMutation.mutate(commentId);
    }
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
        댓글 {commentCount}
      </h3>

      <CommentForm
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
      />

      {isLoading ? (
        <div className="text-center py-8 text-on-surface-disabled text-sm">
          댓글 로딩 중...
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
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </div>
      )}
    </div>
  );
}
