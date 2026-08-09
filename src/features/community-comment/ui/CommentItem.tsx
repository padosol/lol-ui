"use client";

import { useState } from "react";
import { Reply, Pencil, Trash2 } from "lucide-react";
import type { Comment } from "@/entities/community";
import { AuthorAvatar } from "@/entities/community";
import { useAuthStore } from "@/entities/auth";
import { VoteButtons } from "@/shared/ui/vote-buttons";
import { useFormatter, useTranslations } from "next-intl";
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
  const format = useFormatter();
  const t = useTranslations("community.comment");
  const tCommon = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const isAuthor = user?.id === comment.author.id;
  const isReply = comment.depth > 0;

  // 답글은 한 단계 안쪽으로 들여쓰고 살짝 어둡게 깔아 원댓글과 구분한다.
  const wrapperClass = isReply ? "border-t border-divider bg-surface-2/50" : "";
  const bodyClass = `px-4 py-3.5 ${isReply ? "pl-9 sm:pl-12" : ""}`;

  const children = comment.children.map((child) => (
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
  ));

  if (comment.deleted) {
    return (
      <div className={wrapperClass}>
        <div className={`${bodyClass} text-sm italic text-on-surface-disabled`}>
          {t("deleted")}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className={bodyClass}>
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <AuthorAvatar nickname={comment.author.nickname} size="sm" />
          <span className="text-[13.5px] font-bold text-on-surface">
            {comment.author.nickname}
          </span>
          <span className="text-xs text-on-surface-disabled">
            {format.relativeTime(new Date(comment.createdAt))}
            {comment.updatedAt !== comment.createdAt && ` ${t("edited")}`}
          </span>
        </div>

        <div className="ml-8">
          {showEditForm ? (
            <CommentForm
              initialValue={comment.content}
              onSubmit={(content) => {
                onUpdate(comment.id, content);
                setShowEditForm(false);
              }}
              onCancel={() => setShowEditForm(false)}
              isPending={isUpdatePending}
              buttonText={tCommon("edit")}
            />
          ) : (
            <>
              <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-medium">
                {comment.content}
              </p>

              <div className="flex flex-wrap items-center gap-3">
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
                    onClick={() => setShowReplyForm((v) => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    {t("reply")}
                  </button>
                )}
                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-on-surface-disabled hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      {tCommon("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(comment.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-on-surface-disabled hover:text-loss transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      {tCommon("delete")}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                placeholder={t("replyPlaceholder", {
                  nickname: comment.author.nickname,
                })}
                onSubmit={(content) => {
                  onReply(content, comment.id);
                  setShowReplyForm(false);
                }}
                onCancel={() => setShowReplyForm(false)}
                isPending={isReplyPending}
                buttonText={t("reply")}
              />
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
