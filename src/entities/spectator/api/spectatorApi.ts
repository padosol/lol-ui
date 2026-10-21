import type { ApiResponse } from "@/shared/api/types";
import type { QueueTab, SpectatorData } from "../types";
import { apiClient } from "@/shared/api/client";

export async function getQueueTabs(): Promise<QueueTab[]> {
  const response = await apiClient.get<QueueTab[]>("/v1/queue-tab");
  return response.data;
}

export async function getActiveGame(
  puuid: string
): Promise<SpectatorData | null> {
  // 게임 중이 아니면 null. lol-repository 는 200 + data:null 로, lol-server 는 404 로 알려 준다 —
  // 전환 기간에는 둘 중 누가 응답할지 모르니 둘 다 "게임 중 아님"으로 본다.
  try {
    const response = await apiClient.get<ApiResponse<SpectatorData | null>>(
      `/v1/summoners/${puuid}/active-game`
    );
    return response.data.data ?? null;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }
    throw error;
  }
}
