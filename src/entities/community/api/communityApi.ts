import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  Post,
  PostListResponse,
  CreatePostRequest,
  UpdatePostRequest,
  PostListParams,
  PostSearchParams,
} from "../types";

export async function getPosts(params: PostListParams = {}): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/community/posts",
    { params }
  );
  return response.data.data;
}

export async function getPostDetail(postId: number): Promise<Post> {
  const response = await apiClient.get<ApiResponse<Post>>(
    `/community/posts/${postId}`
  );
  return response.data.data;
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
  const response = await apiClient.post<ApiResponse<Post>>(
    "/community/posts",
    data
  );
  return response.data.data;
}

export async function updatePost(postId: number, data: UpdatePostRequest): Promise<Post> {
  const response = await apiClient.put<ApiResponse<Post>>(
    `/community/posts/${postId}`,
    data
  );
  return response.data.data;
}

export async function deletePost(postId: number): Promise<void> {
  await apiClient.delete(`/community/posts/${postId}`);
}

export async function searchPosts(params: PostSearchParams): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/community/posts/search",
    { params }
  );
  return response.data.data;
}

export async function getMyPosts(page: number = 0): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/community/me/posts",
    { params: { page } }
  );
  return response.data.data;
}
