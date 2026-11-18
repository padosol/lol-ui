import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  Post,
  PostViewResult,
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
    "/v1/community/posts",
    { params }
  );
  return response.data.data;
}

export async function getPostDetail(
  postId: number,
  client: AxiosInstance = apiClient,
  config?: AxiosRequestConfig
): Promise<Post> {
  const response = await client.get<ApiResponse<Post>>(
    `/v1/community/posts/${postId}`,
    config
  );
  return response.data.data;
}

/**
 * 조회를 기록한다(24시간 안에는 같은 방문자를 한 번만 센다).
 *
 * 구버전 백엔드는 비로그인 POST 에 401 을 주는데, 그때 인터셉터가 로그인 화면으로
 * 보내면 비로그인 독자가 글을 읽다 쫓겨난다 — `skipAuthRedirect` 로 막는다.
 */
export async function recordPostView(postId: number): Promise<PostViewResult> {
  const response = await apiClient.post<ApiResponse<PostViewResult>>(
    `/v1/community/posts/${postId}/views`,
    undefined,
    { skipAuthRedirect: true }
  );
  return response.data.data;
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
  const response = await apiClient.post<ApiResponse<Post>>(
    "/v1/community/posts",
    data
  );
  return response.data.data;
}

export async function updatePost(postId: number, data: UpdatePostRequest): Promise<Post> {
  const response = await apiClient.put<ApiResponse<Post>>(
    `/v1/community/posts/${postId}`,
    data
  );
  return response.data.data;
}

export async function deletePost(postId: number): Promise<void> {
  await apiClient.delete(`/v1/community/posts/${postId}`);
}

/** 목록과 같은 경로다. keyword 가 비어 있지 않으면 서버가 검색으로 바꿔 카테고리·정렬·기간을 무시한다. */
export async function searchPosts(params: PostSearchParams): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/v1/community/posts",
    { params }
  );
  return response.data.data;
}

export async function getMyPosts(page: number = 0): Promise<PostListResponse> {
  const response = await apiClient.get<ApiResponse<PostListResponse>>(
    "/v1/community/me/posts",
    { params: { page } }
  );
  return response.data.data;
}
