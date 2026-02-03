import type { ApiResponse } from "@/types/api";
import type { QueueTab, SpectatorData } from "@/types/spectator";
import apiClient from "./client";

/**
 * 큐 탭 목록 조회
 */
export async function getQueueTabs(): Promise<QueueTab[]> {
  const response = await apiClient.get<QueueTab[]>("/v1/queue-tab");
  return response.data;
}

/**
 * 현재 게임 정보 조회
 * @param region 지역 (예: "kr", "na1")
 * @param puuid 소환사 PUUID
 * @returns 게임 정보 또는 게임 중이 아닐 경우 null
 */
export async function getActiveGame(
  region: string,
  puuid: string
): Promise<SpectatorData | null> {
  try {
    const response = await apiClient.get<ApiResponse<SpectatorData>>(
      `/v1/${region}/spectator/active-games/by-puuid/${puuid}`
    );
    return response.data.data;
  } catch (error) {
    // 404는 게임 중이 아님을 의미
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
