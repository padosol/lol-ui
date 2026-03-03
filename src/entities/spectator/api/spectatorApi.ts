import type { ApiResponse } from "@/shared/api/types";
import type { QueueTab, SpectatorData } from "../types";
import { apiClient } from "@/shared/api/client";

export async function getQueueTabs(): Promise<QueueTab[]> {
  const response = await apiClient.get<QueueTab[]>("/v1/queue-tab");
  return response.data;
}

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
