"use client";

import { useState } from "react";
import { Reply, Pencil, Trash2 } from "lucide-react";
import type { Comment } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { VoteButtons } from "@/shared/ui/vote-buttons";
import { getRelativeTime } from "@/shared/lib/date";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentCommentId: number) => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onVote: (targetId: number, voteType: "UPVOTE" | "DOWNVOTE") => void;
  isReplyPending?: boolean;
  isUpdatePending?: boolean;
  isVotePending?: boolean;
}

export default function CommentItem({
  comment,
  onReply,
  onUpdate,
  onDelete,
  onVote,
  isReplyPending,
  isUpdatePending,
  isVotePending,
}: CommentItemProps) {
  const user = useAuthStore((s) => s.user);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const isAuthor = user?.id === comment.author.id;

  if (comment.deleted) {
    return (
      <div className={`${comment.depth > 0 ? "ml-8" : ""}`}>
        <div className="py-3 text-sm text-on-surface-disabled italic">
          삭제된 댓글입니다.
        </div>
        {comment.children.map((child) => (
          <CommentItem
            key={child.id}
            comment={child}
            onReply={onReply}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onVote={onVote}
            isReplyPending={isReplyPending}
            isUpdatePending={isUpdatePending}
            isVotePending={isVotePending}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${comment.depth > 0 ? "ml-8" : ""}`}>
      <div className="py-3 border-b border-divider">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-on-surface">
              {comment.author.nickname}
            </span>
            <span className="text-xs text-on-surface-disabled">
              {getRelativeTime(comment.createdAt)}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-on-surface-disabled">(수정됨)</span>
            )}
          </div>
        </div>

        {showEditForm ? (
          <CommentForm
            initialValue={comment.content}
            onSubmit={(content) => {
              onUpdate(comment.id, content);
              setShowEditForm(false);
            }}
            onCancel={() => setShowEditForm(false)}
            isPending={isUpdatePending}
            buttonText="수정"
          />
        ) : (
          <p className="text-sm text-on-surface-medium mb-2 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {!showEditForm && (
          <div className="flex items-center gap-3">
            <VoteButtons
              upvoteCount={comment.upvoteCount}
              downvoteCount={comment.downvoteCount}
              onVote={(voteType) => onVote(comment.id, voteType)}
              isPending={isVotePending}
              size="sm"
            />
            {comment.depth === 0 && (
              <button
                type="button"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
              >
                <Reply className="w-3.5 h-3.5" />
                답글
              </button>
            )}
            {isAuthor && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditForm(true)}
                  className="flex items-center gap-1 text-xs text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="flex items-center gap-1 text-xs text-on-surface-disabled hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  삭제
                </button>
              </>
            )}
          </div>
        )}

        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              placeholder={`${comment.author.nickname}에게 답글...`}
              onSubmit={(content) => {
                onReply(content, comment.id);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
              isPending={isReplyPending}
              buttonText="답글"
            />
          </div>
        )}
      </div>

      {comment.children.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          onReply={onReply}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onVote={onVote}
          isReplyPending={isReplyPending}
          isUpdatePending={isUpdatePending}
          isVotePending={isVotePending}
        />
      ))}
    </div>
  );
}
