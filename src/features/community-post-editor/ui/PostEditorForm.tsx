"use client";

import { useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCategoryTree, useWritableCategories } from "@/entities/community";
import type { PostImage } from "@/entities/community";
import { toast } from "@/shared/ui/toast";
import {
  createPostEditorSchema,
  type PostEditorFormData,
  type PostEditorSubmitData,
} from "../model/postEditorSchema";
import {
  useImageAttachments,
  type ImageErrorKey,
} from "../model/useImageAttachments";
import { MAX_IMAGE_SIZE_MB } from "../model/imageConstraints";
import { imageMarkdown, stripImageMarkdown } from "../lib/imageMarkdown";
import ImageAttachmentBar from "./ImageAttachmentBar";

const TITLE_MAX = 300;

interface PostEditorFormProps {
  defaultValues?: Partial<PostEditorFormData>;
  /** 수정 화면에서 현재 글에 붙어 있는 이미지. 새 글이면 비어 있다. */
  defaultImages?: PostImage[];
  onSubmit: (data: PostEditorSubmitData) => void;
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
  defaultImages,
  onSubmit,
  onCancel,
  isPending = false,
  submitLabel,
}: PostEditorFormProps) {
  const t = useTranslations("community.editor");
  const tImage = useTranslations("community.editor.image");
  const tImageError = useTranslations("community.editor.image.errors");
  const tCommunity = useTranslations("community");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("community.editor.validation");

  const writableCategories = useWritableCategories();
  const { isLoading: isCategoryLoading } = useCategoryTree();
  const writableIds = useMemo(
    () => writableCategories.map((category) => category.id),
    [writableCategories]
  );

  const schema = useMemo(
    () => createPostEditorSchema(tValidation, writableIds),
    [tValidation, writableIds]
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PostEditorFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      // 0 이 곧 "미선택" 이다. undefined 면 zod 가 타입 에러를 먼저
      // 던져 번역된 메시지 대신 기본 문구가 나온다.
      categoryId: 0,
      ...defaultValues,
    },
  });

  const showImageError = useCallback(
    (key: ImageErrorKey) => {
      toast.error(
        key === "tooLarge"
          ? tImageError(key, { size: MAX_IMAGE_SIZE_MB })
          : tImageError(key)
      );
    },
    [tImageError]
  );

  const { attachments, imageIds, isUploading, isFull, upload, remove } =
    useImageAttachments({ initial: defaultImages, onError: showImageError });

  // react-hook-form 의 ref 와 우리 ref 를 함께 물려야 커서 위치를 알 수 있다.
  const { ref: registerContentRef, ...contentField } = register("content");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedCategory = watch("categoryId");
  const title = watch("title") ?? "";
  const content = watch("content") ?? "";

  /** 커서 자리에 끼워 넣는다. 포커스를 잃은 상태면 맨 뒤에 붙인다. */
  const insertAtCursor = useCallback(
    (text: string) => {
      const element = textareaRef.current;
      const current = getValues("content") ?? "";

      if (!element) {
        const separator = current.length > 0 ? "\n\n" : "";
        setValue("content", `${current}${separator}${text}\n`, {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const start = element.selectionStart ?? current.length;
      const end = element.selectionEnd ?? start;
      // 앞 문장에 이어 붙으면 마크다운이 이미지를 문단 안 텍스트로 취급한다.
      const prefix = start > 0 && current[start - 1] !== "\n" ? "\n" : "";
      const block = `${prefix}${text}\n`;
      setValue("content", current.slice(0, start) + block + current.slice(end), {
        shouldValidate: true,
        shouldDirty: true,
      });

      // setValue 로 값이 반영된 뒤라야 커서를 옮길 수 있다.
      requestAnimationFrame(() => {
        element.focus();
        const caret = start + block.length;
        element.setSelectionRange(caret, caret);
      });
    },
    [getValues, setValue]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const uploaded = await upload(files);
      if (uploaded.length > 0) {
        insertAtCursor(uploaded.map((image) => imageMarkdown(image.url)).join("\n"));
      }
    },
    [insertAtCursor, upload]
  );

  const handleRemove = useCallback(
    (imageId: number) => {
      const target = attachments.find((item) => item.image.imageId === imageId);
      if (target) {
        setValue(
          "content",
          stripImageMarkdown(getValues("content") ?? "", target.image.url),
          { shouldValidate: true, shouldDirty: true }
        );
      }
      void remove(imageId);
    },
    [attachments, getValues, remove, setValue]
  );

  const submit = (data: PostEditorFormData) => {
    onSubmit({ ...data, imageIds });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-5 rounded-xl border border-divider bg-surface-1 px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-2">
          <FieldLabel>{t("category")}</FieldLabel>
          <input
            type="hidden"
            {...register("categoryId", { valueAsNumber: true })}
          />
          <div className="flex flex-wrap gap-1.5">
            {isCategoryLoading
              ? // 칩 자리를 잡아둬 라벨이 도착할 때 레이아웃이 튀지 않게 한다.
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[38px] w-20 rounded-lg bg-surface-4"
                    aria-hidden
                  />
                ))
              : writableCategories.map((category) => {
                  const selected = category.id === selectedCategory;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setValue("categoryId", category.id, { shouldValidate: true })
                      }
                      aria-pressed={selected}
                      className={`rounded-lg px-3.5 py-2 text-[13.5px] transition-colors cursor-pointer ${
                        selected
                          ? "bg-primary font-bold text-surface"
                          : "bg-surface-4 font-medium text-on-surface-medium hover:bg-surface-8 hover:text-on-surface"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
          </div>
          {errors.categoryId && (
            <p className="text-xs text-loss">{errors.categoryId.message}</p>
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
            {...contentField}
            ref={(element) => {
              registerContentRef(element);
              textareaRef.current = element;
            }}
            placeholder={t("contentPlaceholder")}
            rows={14}
            onPaste={(event) => {
              // 스크린샷 붙여넣기. 파일이 없으면 평범한 텍스트 붙여넣기이므로 건드리지 않는다.
              const files = Array.from(event.clipboardData.files);
              if (files.length > 0) {
                event.preventDefault();
                void handleFiles(files);
              }
            }}
            onDragOver={(event) => {
              // 막지 않으면 브라우저가 파일을 새 탭으로 열어 작성 중인 글이 날아간다.
              if (event.dataTransfer.types.includes("Files")) {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              const files = Array.from(event.dataTransfer.files);
              if (files.length > 0) {
                event.preventDefault();
                void handleFiles(files);
              }
            }}
            className="w-full resize-none rounded-lg border border-divider bg-surface-2 px-4 py-3.5 text-[15px] leading-[1.8] text-on-surface placeholder:text-on-surface-disabled focus:border-primary focus:outline-none"
          />
          {errors.content && (
            <p className="text-xs text-loss">{errors.content.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>{tImage("label")}</FieldLabel>
          <ImageAttachmentBar
            attachments={attachments}
            isUploading={isUploading}
            isFull={isFull}
            onSelect={(files) => void handleFiles(files)}
            onRemove={handleRemove}
          />
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
          // 목록이 오기 전에는 writableCodes 가 비어 있어 정상 입력도 거부된다.
          // 업로드 중 제출하면 아직 id 를 못 받은 이미지가 본문에서 빠진 채 저장된다.
          disabled={isPending || isCategoryLoading || isUploading}
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
