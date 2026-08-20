"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import {
  useDeletePostImage,
  useUploadPostImage,
  type PostImage,
} from "@/entities/community";
import {
  MAX_IMAGES_PER_POST,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageType,
} from "./imageConstraints";

/** 호출부가 messages 의 `community.editor.image.errors.*` 키로 번역한다. */
export type ImageErrorKey =
  | "tooLarge"
  | "unsupportedType"
  | "tooMany"
  | "uploadFailed"
  | "rateLimited"
  | "removeFailed";

export interface Attachment {
  image: PostImage;
  /**
   * 이번 편집에서 새로 올려 아직 어떤 글에도 붙지 않은 이미지.
   *
   * 제거 방식이 갈리기 때문에 구분한다 — 새 이미지는 서버에서 즉시 지워 고아를 만들지 않고,
   * 이미 글에 붙어 있던 이미지는 <b>지우면 안 된다</b>(서버가 미첨부 상태만 삭제를 허용해
   * 403 이 난다). 후자는 저장할 `imageIds` 에서 빠지는 것으로 떨어져 나간다.
   */
  isNew: boolean;
}

interface UseImageAttachmentsOptions {
  initial?: PostImage[];
  onError: (key: ImageErrorKey) => void;
}

/**
 * 업로드 요청이 실패했을 때 사용자에게 보여줄 키를 고른다.
 *
 * 서버 `ErrorMessage.errorCode` 는 `E400`/`E429` 같은 <b>상태 코드 계열</b>이라
 * `IMAGE_SIZE_EXCEEDED` 와 `IMAGE_TYPE_NOT_SUPPORTED` 를 구분해 주지 않는다. 그래서
 * HTTP 상태로만 가른다. 용량·형식은 어차피 업로드 전에 걸러지므로, 여기까지 온 400 은
 * 클라이언트가 예상하지 못한 경우이고 일반 메시지가 맞다.
 */
function toErrorKey(error: unknown): ImageErrorKey {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    return "rateLimited";
  }
  return "uploadFailed";
}

export function useImageAttachments({
  initial = [],
  onError,
}: UseImageAttachmentsOptions) {
  const [attachments, setAttachments] = useState<Attachment[]>(() =>
    initial.map((image) => ({ image, isNew: false }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUploadPostImage();
  const deleteMutation = useDeletePostImage();

  /**
   * 선택·붙여넣기·드롭으로 들어온 파일을 순서대로 올리고, 성공한 것만 돌려준다.
   *
   * 병렬로 쏘지 않는 이유: 서버가 분당 업로드 수를 제한하고 있어 한꺼번에 던지면
   * 뒤쪽이 429 로 튕긴다. 한 장이 실패해도 나머지는 계속 올린다.
   */
  const upload = useCallback(
    async (files: File[]): Promise<PostImage[]> => {
      if (files.length === 0) {
        return [];
      }

      const remaining = MAX_IMAGES_PER_POST - attachments.length;
      if (remaining <= 0) {
        onError("tooMany");
        return [];
      }
      const targets = files.slice(0, remaining);
      if (files.length > remaining) {
        onError("tooMany");
      }

      setIsUploading(true);
      const uploaded: PostImage[] = [];
      try {
        for (const file of targets) {
          if (!isAllowedImageType(file.type)) {
            onError("unsupportedType");
            continue;
          }
          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            onError("tooLarge");
            continue;
          }
          try {
            uploaded.push(await uploadMutation.mutateAsync(file));
          } catch (error) {
            onError(toErrorKey(error));
          }
        }
      } finally {
        setIsUploading(false);
      }

      if (uploaded.length > 0) {
        setAttachments((prev) => [
          ...prev,
          ...uploaded.map((image) => ({ image, isNew: true })),
        ]);
      }
      return uploaded;
    },
    [attachments.length, onError, uploadMutation]
  );

  /**
   * 목록에서 빼고, 새로 올린 것이면 스토리지에서도 지운다.
   *
   * 서버 삭제가 실패해도 목록에서는 뺀다 — 사용자가 "뺐다"고 인지한 이미지가 화면에 남는
   * 편이 더 나쁘고, 남은 파일은 미첨부 상태로 유예가 지나면 정리 배치가 가져간다.
   */
  const remove = useCallback(
    async (imageId: number) => {
      const target = attachments.find((item) => item.image.imageId === imageId);
      setAttachments((prev) =>
        prev.filter((item) => item.image.imageId !== imageId)
      );

      if (target?.isNew) {
        try {
          await deleteMutation.mutateAsync(imageId);
        } catch {
          onError("removeFailed");
        }
      }
    },
    [attachments, deleteMutation, onError]
  );

  return {
    attachments,
    imageIds: attachments.map((item) => item.image.imageId),
    isUploading,
    isFull: attachments.length >= MAX_IMAGES_PER_POST,
    upload,
    remove,
  };
}
