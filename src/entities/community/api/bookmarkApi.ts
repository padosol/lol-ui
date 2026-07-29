import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { PostListResponse } from "../types";

function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

/**
 * 이 파일은 entities API 중 유일하게 예외를 흡수한다.
 *
 * 서버는 중복 북마크에 409, 없는 북마크 해제에 404 를 준다. 둘 다 "요청이 실패했다"가
 * 아니라 "원하는 상태에 이미 도달해 있다"는 뜻이다. 토글에서는 성공과 구분할 이유가
 * 없고, 구분하면 더블클릭처럼 흔한 조작이 곧바로 에러로 보인다.
 * 여기서 접어서 add/remove 를 멱등하게 만든다.
 */
export async function addBookmark(postId: number): Promise<void> {
  try {
    await apiClient.post("/community/bookmarks", { postId });
  } catch (error) {
    if (statusOf(error) !== 409) throw error;
  }
}

export async function removeBookmark(postId: number): Promise<void> {
  try {
    await apiClient.delete(`/community/bookmarks/${postId}`);
  } catch (error) {
    if (statusOf(error) !== 404) throw error;
  }
}

export async function getMyBookmarks(
  page: number = 0
): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/community/me/bookmarks",
    { params: { page } }
  );
  return response.data.data;
}
