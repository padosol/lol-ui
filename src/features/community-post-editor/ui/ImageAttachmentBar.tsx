"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, X } from "lucide-react";
import { IMAGE_ACCEPT, MAX_IMAGES_PER_POST } from "../model/imageConstraints";
import type { Attachment } from "../model/useImageAttachments";

interface ImageAttachmentBarProps {
  attachments: Attachment[];
  isUploading: boolean;
  isFull: boolean;
  onSelect: (files: File[]) => void;
  onRemove: (imageId: number) => void;
}

export default function ImageAttachmentBar({
  attachments,
  isUploading,
  isFull,
  onSelect,
  onRemove,
}: Readonly<ImageAttachmentBarProps>) {
  const t = useTranslations("community.editor.image");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading || isFull}
          className="flex items-center gap-1.5 rounded-lg bg-surface-4 px-3 py-2 text-[13px] font-semibold text-on-surface-medium transition-colors hover:bg-surface-8 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden />
          )}
          {isUploading ? t("uploading") : t("attach")}
        </button>

        <span className="text-xs text-on-surface-disabled">
          {t("count", {
            count: attachments.length,
            max: MAX_IMAGES_PER_POST,
          })}
        </span>

        <span className="text-xs text-on-surface-disabled">{t("hint")}</span>

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            // 같은 파일을 연달아 고를 수 있게 값을 비운다. 비우지 않으면 change 가 안 뜬다.
            event.target.value = "";
            if (files.length > 0) {
              onSelect(files);
            }
          }}
        />
      </div>

      {attachments.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {attachments.map(({ image }) => (
            <li key={image.imageId} className="relative">
              {/* next/image 를 쓰지 않는 이유는 PostContent 와 같다 — CDN 도메인이 환경마다 다르다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                className="h-16 w-16 rounded-lg border border-divider object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(image.imageId)}
                aria-label={t("remove")}
                title={t("remove")}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-surface-8 p-1 text-on-surface-medium transition-colors hover:bg-loss hover:text-surface cursor-pointer"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
