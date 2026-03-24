"use client";

import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isPending?: boolean;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  isPending = false,
  placeholder = "댓글을 입력하세요...",
  buttonText = "등록",
  initialValue = "",
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!initialValue) setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary resize-none"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-on-surface-medium hover:text-on-surface transition-colors"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="px-4 py-1.5 bg-primary hover:bg-primary/80 text-on-surface text-sm font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? "등록 중..." : buttonText}
        </button>
      </div>
    </form>
  );
}
