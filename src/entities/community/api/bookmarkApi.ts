import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { PostListResponse } from "../types";

/**
 * 북마크는 글의 하위 리소스이고 PUT·DELETE 모두 멱등이다 — 이미 북마크한 글에 PUT 해도,
 * 없는 북마크를 DELETE 해도 성공(200·204)이다. 더블클릭 같은 중복 조작이 에러로 보이지 않는다.
 */
export async function addBookmark(postId: number): Promise<void> {
  await apiClient.put(`/v1/community/posts/${postId}/bookmark`);
}

export async function removeBookmark(postId: number): Promise<void> {
  await apiClient.delete(`/v1/community/posts/${postId}/bookmark`);
}

export async function getMyBookmarks(
  page: number = 0
): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/v1/community/me/bookmarks",
    { params: { page } }
  );
  return response.data.data;
}
