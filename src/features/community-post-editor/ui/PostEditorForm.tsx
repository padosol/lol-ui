"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { POST_CATEGORIES, POST_CATEGORY_LABELS } from "@/entities/community";
import { postEditorSchema, type PostEditorFormData } from "../model/postEditorSchema";

interface PostEditorFormProps {
  defaultValues?: Partial<PostEditorFormData>;
  onSubmit: (data: PostEditorFormData) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function PostEditorForm({
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "등록",
}: PostEditorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostEditorFormData>({
    resolver: zodResolver(postEditorSchema),
    defaultValues: {
      title: "",
      content: "",
      category: undefined,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface-medium mb-1">
          카테고리 <span className="text-red-400">*</span>
        </label>
        <select
          {...register("category")}
          className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="">카테고리를 선택해주세요</option>
          {POST_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {POST_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-medium mb-1">
          제목 <span className="text-red-400">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="제목을 입력해주세요 (최대 300자)"
          maxLength={300}
          className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-medium mb-1">
          내용 <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register("content")}
          placeholder="내용을 입력해주세요"
          rows={12}
          className="w-full bg-surface-4 border border-divider rounded-md px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-primary resize-none"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-on-surface font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? "처리 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
