import type { AxiosInstance } from "axios";
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

/**
 * 목록 조회. 서버 컴포넌트에서는 serverApiClient 를 넘겨 내부 네트워크로 호출한다
 * (브라우저 전용 apiClient 는 NEXT_PUBLIC_API_URL 을 보므로 서버에서 쓸 수 없다).
 */
export async function getPosts(
  params: PostListParams = {},
  client: AxiosInstance = apiClient
): Promise<PostListResponse> {
  const response = await client.get<ApiResponse<PostListResponse>>(
    "/community/posts",
    { params }
  );
  return response.data.data;
}

export async function getPostDetail(
  postId: number,
  client: AxiosInstance = apiClient
): Promise<Post> {
  const response = await client.get<ApiResponse<Post>>(
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
