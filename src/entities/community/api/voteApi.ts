import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { VoteRequest, VoteResponse, VoteTargetType } from "../types";

export async function vote(data: VoteRequest): Promise<VoteResponse> {
  const response = await apiClient.post<ApiResponse<VoteResponse>>(
    "/community/votes",
    data
  );
  return response.data.data;
}

export async function removeVote(
  targetType: VoteTargetType,
  targetId: number
): Promise<void> {
  await apiClient.delete(`/community/votes/${targetType}/${targetId}`);
}
