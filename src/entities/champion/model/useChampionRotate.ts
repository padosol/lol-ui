import { getChampionRotate } from "../api/championApi";
import type { ChampionRotationResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useChampionRotate(region: string = "kr") {
  return useQuery<ChampionRotationResponse, Error>({
    queryKey: ["champion", "rotate", region],
    queryFn: () => getChampionRotate(region),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
