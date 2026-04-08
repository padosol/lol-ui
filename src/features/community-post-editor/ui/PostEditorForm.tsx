"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { POST_CATEGORIES, POST_CATEGORY_LABELS } from "@/entities/community";
import type { PostCategory } from "@/entities/community";
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
    setValue,
    watch,
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

  const selectedCategory = watch("category") as PostCategory | undefined;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
      setCategoryOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface-medium mb-1">
          카테고리 <span className="text-red-400">*</span>
        </label>
        <input type="hidden" {...register("category")} />
        <div ref={categoryRef} className="relative">
          <button
            type="button"
            onClick={() => setCategoryOpen((v) => !v)}
            className="w-full bg-surface-4 hover:bg-surface-8 border border-divider rounded-lg px-3 py-2 pr-8 text-sm text-on-surface cursor-pointer focus:outline-none text-left"
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
          >
            {selectedCategory
              ? POST_CATEGORY_LABELS[selectedCategory]
              : <span className="text-on-surface-disabled">카테고리를 선택해주세요</span>}
            <ChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-medium transition-transform ${categoryOpen ? "rotate-180" : ""}`}
            />
          </button>
          {categoryOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-surface-4 border border-divider rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1 max-h-[280px] overflow-y-auto" role="listbox" aria-label="카테고리 선택">
                {POST_CATEGORIES.map((cat) => {
                  const selected = cat === selectedCategory;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setValue("category", cat, { shouldValidate: true });
                        setCategoryOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                        selected
                          ? "bg-surface-8 text-on-surface font-medium"
                          : "text-on-surface hover:bg-surface-8"
                      }`}
                      role="option"
                      aria-selected={selected}
                    >
                      {POST_CATEGORY_LABELS[cat]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
          className="px-6 py-2.5 bg-primary hover:bg-primary/80 text-on-surface font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "처리 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
