import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { PostImage } from "../types";

/** 5MB 파일이 느린 회선을 타면 기본 10초 안에 못 끝난다. */
const UPLOAD_TIMEOUT_MS = 60_000;

/**
 * 본문 이미지 업로드. 응답의 `url` 은 CDN 영구 URL 이라 그대로 본문에 박아도 된다
 * (presigned 가 아니므로 만료되지 않는다).
 *
 * `Content-Type` 을 명시적으로 넘기는 이유: apiClient 의 기본 헤더가
 * `application/json` 인데, axios 는 <b>JSON content-type + FormData</b> 조합을 만나면
 * FormData 를 JSON 으로 직렬화해 버린다(`transformRequest`). 그대로 두면 파일이 아니라
 * 빈 객체가 날아간다. multipart 로 바꿔 두면 이 변환을 건너뛰고, 그다음 axios 의
 * xhr 어댑터가 헤더를 다시 지워 브라우저가 boundary 를 직접 붙인다.
 */
export async function uploadPostImage(file: File): Promise<PostImage> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<PostImage>>(
    "/community/images",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: UPLOAD_TIMEOUT_MS,
    }
  );
  return response.data.data;
}

/**
 * 업로드했지만 아직 글에 붙지 않은 이미지를 즉시 지운다.
 *
 * <b>이미 글에 첨부된 이미지에는 쓰면 안 된다</b> — 서버가 미첨부 상태만 허용해 403 이 난다.
 * 첨부된 이미지는 글 저장 시 `imageIds` 에서 빼는 것으로 떨어진다.
 */
export async function deletePostImage(imageId: number): Promise<void> {
  await apiClient.delete(`/community/images/${imageId}`);
}
