import { getActiveGame, getQueueTabs } from "@/lib/api/spectator";
import type { QueueTab, SpectatorData } from "@/types/spectator";
import { useQuery } from "@tanstack/react-query";

/**
 * 큐 탭 목록 조회 훅
 */
export function useQueueTabs() {
  return useQuery<QueueTab[], Error>({
    queryKey: ["queueTabs"],
    queryFn: getQueueTabs,
    staleTime: 60 * 60 * 1000, // 1시간 캐시
  });
}

/**
 * 현재 게임 정보 조회 훅
 * @param region 지역 (예: "kr", "na1")
 * @param puuid 소환사 PUUID
 */
export function useActiveGame(region: string, puuid: string | null | undefined) {
  return useQuery<SpectatorData | null, Error>({
    queryKey: ["spectator", "activeGame", region, puuid],
    queryFn: () => getActiveGame(region, puuid!),
    enabled: !!region && !!puuid,
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
    staleTime: 15 * 1000, // 15초간 캐시
  });
}
