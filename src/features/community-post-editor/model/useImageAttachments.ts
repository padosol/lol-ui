"use client";

import { useCallback, useMemo, useState } from "react";
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
  /**
   * 본문에 살아 있는 이미지 URL. 여기 없는 이미지는 목록에서 빠지고 저장되지도 않는다.
   *
   * <p>`null` 은 "아직 모른다"(에디터가 만들어지기 전)라 거르지 않는다.
   */
  attachedUrls: ReadonlySet<string> | null;
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
  attachedUrls,
}: UseImageAttachmentsOptions) {
  /** 이번 편집에서 알게 된 이미지 전부. 본문에서 빠져도 여기서는 지우지 않는다. */
  const [known, setKnown] = useState<Attachment[]>(() =>
    initial.map((image) => ({ image, isNew: false }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUploadPostImage();
  const deleteMutation = useDeletePostImage();

  /**
   * 본문에 남아 있는 것만 추린 첨부. 화면에 보이는 것도, 저장되는 것도 이 목록이다.
   *
   * <p>본문에서 지워진 이미지를 {@link known} 에서까지 빼지 않는 이유는 <b>되돌리기</b>다.
   * Ctrl+Z 로 이미지가 본문에 돌아오면 첨부도 같이 살아나야 한다. 대장에서 지워 버리면
   * 본문에는 URL 이 있는데 `imageIds` 에는 없는 글이 저장되고, 그 파일은 미첨부 상태로
   * 유예가 지나 사라진다 — 멀쩡히 저장한 글이 며칠 뒤 깨진다.
   */
  const attachments = useMemo(
    () =>
      attachedUrls === null
        ? known
        : known.filter((item) => attachedUrls.has(item.image.url)),
    [known, attachedUrls]
  );

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
        setKnown((prev) => [
          ...prev,
          ...uploaded.map((image) => ({ image, isNew: true })),
        ]);
      }
      return uploaded;
    },
    [attachments.length, onError, uploadMutation]
  );

  /**
   * 썸네일의 X 로 <b>대놓고</b> 뺄 때. 대장에서 지우고, 새로 올린 것이면 스토리지에서도 지운다.
   *
   * <p>본문에서 지우는 것과 다르다. 그쪽은 되돌릴 수 있어야 해서 대장을 남겨 두지만,
   * 여기는 사용자가 "이 파일 치워라"라고 말한 것이라 되살릴 여지를 두지 않는다.
   *
   * <p>서버 삭제가 실패해도 목록에서는 뺀다 — 사용자가 "뺐다"고 인지한 이미지가 화면에 남는
   * 편이 더 나쁘고, 남은 파일은 미첨부 상태로 유예가 지나면 정리 배치가 가져간다.
   */
  const remove = useCallback(
    async (imageId: number) => {
      const target = known.find((item) => item.image.imageId === imageId);
      setKnown((prev) => prev.filter((item) => item.image.imageId !== imageId));

      if (target?.isNew) {
        try {
          await deleteMutation.mutateAsync(imageId);
        } catch {
          onError("removeFailed");
        }
      }
    },
    [known, deleteMutation, onError]
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
