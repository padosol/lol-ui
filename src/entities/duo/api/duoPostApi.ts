import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  DuoPost,
  DuoPostListResponse,
  CreateDuoPostRequest,
  DuoPostFilters,
} from "../types";

export async function getDuoPosts(
  params: DuoPostFilters = {},
): Promise<DuoPostListResponse> {
  const response = await apiClient.get<ApiResponse<DuoPostListResponse>>(
    "/duo/posts",
    { params },
  );
  return response.data.data;
}

export async function getDuoPostDetail(postId: number): Promise<DuoPost> {
  const response = await apiClient.get<ApiResponse<DuoPost>>(
    `/duo/posts/${postId}`,
  );
  return response.data.data;
}

export async function createDuoPost(
  data: CreateDuoPostRequest,
): Promise<DuoPost> {
  const response = await apiClient.post<ApiResponse<DuoPost>>(
    "/duo/posts",
    data,
  );
  return response.data.data;
}

export async function updateDuoPost(
  postId: number,
  data: CreateDuoPostRequest,
): Promise<DuoPost> {
  const response = await apiClient.put<ApiResponse<DuoPost>>(
    `/duo/posts/${postId}`,
    data,
  );
  return response.data.data;
}

export async function deleteDuoPost(postId: number): Promise<void> {
  await apiClient.delete(`/duo/posts/${postId}`);
}

export async function getMyDuoPosts(
  page: number = 0,
): Promise<DuoPostListResponse> {
  const response = await apiClient.get<ApiResponse<DuoPostListResponse>>(
    "/duo/me/posts",
    { params: { page } },
  );
  return response.data.data;
}
