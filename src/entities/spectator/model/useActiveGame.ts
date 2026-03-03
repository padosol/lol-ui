import { getActiveGame } from "../api/spectatorApi";
import type { SpectatorData } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useActiveGame(region: string, puuid: string | null | undefined) {
  return useQuery<SpectatorData | null, Error>({
    queryKey: ["spectator", "activeGame", region, puuid],
    queryFn: () => getActiveGame(region, puuid!),
    enabled: !!region && !!puuid,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}
