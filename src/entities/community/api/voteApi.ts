import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { VoteRequest, VoteResponse, VoteTargetType } from "../types";

/** 투표는 글·댓글의 하위 리소스다. 대상 종류는 본문이 아니라 경로로 고른다. */
function votePath(targetType: VoteTargetType, targetId: number): string {
  return targetType === "POST"
    ? `/v1/community/posts/${targetId}/vote`
    : `/v1/community/comments/${targetId}/vote`;
}

export async function vote({
  targetType,
  targetId,
  voteType,
}: VoteRequest): Promise<VoteResponse> {
  const response = await apiClient.put<ApiResponse<VoteResponse>>(
    votePath(targetType, targetId),
    { voteType }
  );
  return response.data.data;
}

export async function removeVote(
  targetType: VoteTargetType,
  targetId: number
): Promise<void> {
  await apiClient.delete(votePath(targetType, targetId));
}
