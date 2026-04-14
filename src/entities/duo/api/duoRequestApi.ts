import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  DuoRequest,
  DuoRequestListResponse,
  CreateDuoRequestPayload,
  MatchActionResponse,
} from "../types";

export async function createDuoRequest(
  postId: number,
  data: CreateDuoRequestPayload,
): Promise<DuoRequest> {
  const response = await apiClient.post<ApiResponse<DuoRequest>>(
    `/duo/posts/${postId}/requests`,
    data,
  );
  return response.data.data;
}

export async function acceptDuoRequest(
  requestId: number,
): Promise<MatchActionResponse> {
  const response = await apiClient.put<ApiResponse<MatchActionResponse>>(
    `/duo/requests/${requestId}/accept`,
  );
  return response.data.data;
}

export async function confirmDuoRequest(
  requestId: number,
): Promise<MatchActionResponse> {
  const response = await apiClient.put<ApiResponse<MatchActionResponse>>(
    `/duo/requests/${requestId}/confirm`,
  );
  return response.data.data;
}

export async function rejectDuoRequest(requestId: number): Promise<void> {
  await apiClient.put(`/duo/requests/${requestId}/reject`);
}

export async function cancelDuoRequest(requestId: number): Promise<void> {
  await apiClient.put(`/duo/requests/${requestId}/cancel`);
}

export async function getMyDuoRequests(
  page: number = 0,
): Promise<DuoRequestListResponse> {
  const response = await apiClient.get<ApiResponse<DuoRequestListResponse>>(
    "/duo/me/requests",
    { params: { page } },
  );
  return response.data.data;
}
