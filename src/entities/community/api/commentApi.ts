import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "../types";

export async function getComments(postId: number): Promise<Comment[]> {
  const response = await apiClient.get<ApiResponse<Comment[]>>(
    `/community/posts/${postId}/comments`
  );
  return response.data.data;
}

export async function createComment(
  postId: number,
  data: CreateCommentRequest
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/community/posts/${postId}/comments`,
    data
  );
  return response.data.data;
}

export async function updateComment(
  commentId: number,
  data: UpdateCommentRequest
): Promise<Comment> {
  const response = await apiClient.put<ApiResponse<Comment>>(
    `/community/comments/${commentId}`,
    data
  );
  return response.data.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/community/comments/${commentId}`);
}
