import { getChampionRotate } from "@/lib/api/champion";
import type { ChampionRotationResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * 챔피언 로테이션 조회 훅
 * @param region 조회할 지역 (기본값: "kr")
 * @returns 챔피언 로테이션 정보
 */
export function useChampionRotate(region: string = "kr") {
  return useQuery<ChampionRotationResponse, Error>({
    queryKey: ["champion", "rotate", region],
    queryFn: () => getChampionRotate(region),
    staleTime: 24 * 60 * 60 * 1000, // 24시간간 캐시 유지 (로테이션은 하루에 한 번 변경)
  });
}

