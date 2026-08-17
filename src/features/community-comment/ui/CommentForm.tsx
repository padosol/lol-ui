"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthorAvatar } from "@/entities/community";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isPending?: boolean;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  onCancel?: () => void;
  /** 로그인 사용자 닉네임 — 새 댓글 입력창에서 아바타로 보여준다 */
  authorNickname?: string;
}

export default function CommentForm({
  onSubmit,
  isPending = false,
  placeholder,
  buttonText,
  initialValue = "",
  onCancel,
  authorNickname,
}: CommentFormProps) {
  const t = useTranslations("community.comment");
  const tCommon = useTranslations("common");
  const [content, setContent] = useState(initialValue);

  // 취소 버튼이 있으면 답글·수정 폼(인라인 확장), 없으면 본문 하단의 새 댓글 입력창.
  const isStandalone = !onCancel;

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!initialValue) setContent("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const submitLabel = isPending ? t("submitting") : (buttonText ?? t("submit"));

  if (isStandalone) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-start gap-3 bg-surface-1 border border-divider rounded-xl p-3 focus-within:border-primary/50 transition-colors"
      >
        {authorNickname && (
          <AuthorAvatar nickname={authorNickname} size="sm" highlight />
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("placeholder")}
          rows={2}
          className="flex-1 min-w-0 resize-none bg-transparent text-sm leading-relaxed text-on-surface placeholder:text-on-surface-disabled focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="shrink-0 rounded-lg bg-primary hover:bg-primary/80 px-4 py-2 text-[13.5px] font-bold text-surface transition-colors disabled:opacity-40 cursor-pointer"
        >
          {submitLabel}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? t("placeholder")}
        rows={3}
        className="w-full resize-none rounded-lg border border-divider bg-surface-4 px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-primary focus:outline-none"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-on-surface-medium hover:text-on-surface transition-colors cursor-pointer"
        >
          {tCommon("cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-primary hover:bg-primary/80 px-4 py-1.5 text-sm font-bold text-surface transition-colors disabled:opacity-40 cursor-pointer"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
