import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { PostListResponse } from "../types";

export async function addBookmark(postId: number): Promise<void> {
  await apiClient.post("/community/bookmarks", { postId });
}

export async function removeBookmark(postId: number): Promise<void> {
  await apiClient.delete(`/community/bookmarks/${postId}`);
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
