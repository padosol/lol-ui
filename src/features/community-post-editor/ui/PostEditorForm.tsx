"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { POST_CATEGORIES } from "@/entities/community";
import {
  createPostEditorSchema,
  type PostEditorFormData,
} from "../model/postEditorSchema";

const TITLE_MAX = 300;

interface PostEditorFormProps {
  defaultValues?: Partial<PostEditorFormData>;
  onSubmit: (data: PostEditorFormData) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-bold tracking-widest text-on-surface-disabled">
        {children}
      </span>
      <div className="flex-1" />
      {hint && (
        <span className="text-xs font-semibold text-on-surface-disabled">{hint}</span>
      )}
    </div>
  );
}

export default function PostEditorForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
  submitLabel,
}: PostEditorFormProps) {
  const t = useTranslations("community.editor");
  const tCommunity = useTranslations("community");
  const tCommon = useTranslations("common");
  const tCategory = useTranslations("domain.postCategory");
  const tValidation = useTranslations("community.editor.validation");

  const schema = useMemo(() => createPostEditorSchema(tValidation), [tValidation]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostEditorFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      category: undefined,
      ...defaultValues,
    },
  });

  const selectedCategory = watch("category");
  const title = watch("title") ?? "";
  const content = watch("content") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-5 rounded-xl border border-divider bg-surface-1 px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-2">
          <FieldLabel>{t("category")}</FieldLabel>
          <input type="hidden" {...register("category")} />
          <div className="flex flex-wrap gap-1.5">
            {POST_CATEGORIES.map((cat) => {
              const selected = cat === selectedCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue("category", cat, { shouldValidate: true })}
                  aria-pressed={selected}
                  className={`rounded-lg px-3.5 py-2 text-[13.5px] transition-colors cursor-pointer ${
                    selected
                      ? "bg-primary font-bold text-surface"
                      : "bg-surface-4 font-medium text-on-surface-medium hover:bg-surface-8 hover:text-on-surface"
                  }`}
                >
                  {tCategory(cat)}
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="text-xs text-loss">{errors.category.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel hint={`${title.length}/${TITLE_MAX}`}>
            {t("postTitle")}
          </FieldLabel>
          <input
            {...register("title")}
            placeholder={t("titlePlaceholder")}
            maxLength={TITLE_MAX}
            className="w-full border-0 border-b-2 border-divider bg-transparent pb-3 pt-1.5 text-lg font-bold tracking-tight text-on-surface placeholder:font-normal placeholder:text-on-surface-disabled focus:border-primary focus:outline-none"
          />
          {errors.title && <p className="text-xs text-loss">{errors.title.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel hint={t("contentCount", { count: content.length })}>
            {t("content")}
          </FieldLabel>
          <textarea
            {...register("content")}
            placeholder={t("contentPlaceholder")}
            rows={14}
            className="w-full resize-none rounded-lg border border-divider bg-surface-2 px-4 py-3.5 text-[15px] leading-[1.8] text-on-surface placeholder:text-on-surface-disabled focus:border-primary focus:outline-none"
          />
          {errors.content && (
            <p className="text-xs text-loss">{errors.content.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-surface-4 px-4 py-2.5 text-sm font-bold text-on-surface-medium hover:bg-surface-8 hover:text-on-surface transition-colors cursor-pointer"
          >
            {tCommon("cancel")}
          </button>
        )}
        <div className="flex-1" />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-7 py-2.5 text-sm font-bold text-surface hover:bg-primary/80 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isPending ? tCommon("processing") : (submitLabel ?? tCommunity("submit"))}
        </button>
      </div>

      <p className="text-[12.5px] leading-relaxed text-on-surface-disabled">
        {t("guideline")}
      </p>
    </form>
  );
}
