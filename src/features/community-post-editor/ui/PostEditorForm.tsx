"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEditorState, type Editor } from "@tiptap/react";
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
import { usePostEditor } from "../model/usePostEditor";
import { useDocumentImageUrls } from "../model/useDocumentImageUrls";
import { MAX_IMAGE_SIZE_MB } from "../model/imageConstraints";
import { insertImages, removeImageByUrl } from "../lib/editorImages";
import ImageAttachmentBar from "./ImageAttachmentBar";
import PostEditor from "./PostEditor";

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

/**
 * 글자 수만 따로 떼어 낸 컴포넌트.
 *
 * 폼 본체에서 세면 타이핑 한 글자마다 폼 전체가 다시 그려진다. 여기서 구독하면
 * 다시 그려지는 것은 이 span 뿐이다.
 */
function CharacterCounter({ editor }: Readonly<{ editor: Editor | null }>) {
  const t = useTranslations("community.editor");
  const count = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current?.storage.characterCount.characters() ?? 0,
  });

  return (
    <span className="text-xs font-semibold text-on-surface-disabled">
      {t("contentCount", { count: count ?? 0 })}
    </span>
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

  // 붙여넣기·드롭 핸들러는 에디터를 만들 때 캡처되는데, 그 핸들러가 하는 일(업로드 →
  // 본문 삽입)에는 다시 에디터가 필요하다. ref 를 한 칸 끼워 순환을 끊는다.
  const handleFilesRef = useRef<(files: File[]) => void>(() => {});

  const editor = usePostEditor({
    initialMarkdown: defaultValues?.content ?? "",
    placeholder: t("contentPlaceholder"),
    ariaLabel: t("content"),
    onChange: (markdown) =>
      setValue("content", markdown, { shouldValidate: true, shouldDirty: true }),
    onImageFiles: (files) => handleFilesRef.current(files),
  });

  // 첨부 목록의 주인은 본문이다. 본문에서 지운 이미지는 아래 썸네일에서도 사라지고
  // 저장할 imageIds 에서도 빠진다 — 글에 안 보이는 이미지가 붙어 있으면 안 된다.
  const documentImageUrls = useDocumentImageUrls(editor);

  const { attachments, imageIds, isUploading, isFull, upload, remove } =
    useImageAttachments({
      initial: defaultImages,
      onError: showImageError,
      attachedUrls: documentImageUrls,
    });

  const handleFiles = useCallback(
    async (files: File[]) => {
      const uploaded = await upload(files);
      if (uploaded.length > 0 && editor) {
        insertImages(
          editor,
          uploaded.map((image) => image.url)
        );
      }
    },
    [editor, upload]
  );

  useEffect(() => {
    handleFilesRef.current = (files: File[]) => void handleFiles(files);
  }, [handleFiles]);

  const handleRemove = useCallback(
    (imageId: number) => {
      const target = attachments.find((item) => item.image.imageId === imageId);
      if (target && editor) {
        removeImageByUrl(editor, target.image.url);
      }
      void remove(imageId);
    },
    [attachments, editor, remove]
  );

  const selectedCategory = watch("categoryId");
  const title = watch("title") ?? "";

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
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold tracking-widest text-on-surface-disabled">
              {t("content")}
            </span>
            <div className="flex-1" />
            <CharacterCounter editor={editor} />
          </div>
          {/*
            본문의 주인은 에디터다. 폼에는 자리만 만들어 두고 값은 onChange 에서
            setValue 로 넣는다 — categoryId 와 같은 방식이다.
          */}
          <input type="hidden" {...register("content")} />
          <PostEditor editor={editor} disabled={isUploading} />
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
