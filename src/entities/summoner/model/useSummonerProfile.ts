import { getSummonerProfile } from "../api/summonerApi";
import type { SummonerProfile } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useSummonerProfile(
  gameName: string,
  region: string = "kr",
  options?: { initialData?: SummonerProfile }
) {
  return useQuery<SummonerProfile, Error>({
    queryKey: ["summoner", "profile", gameName, region],
    queryFn: () => getSummonerProfile(gameName, region),
    enabled: !!gameName,
    staleTime: 5 * 60 * 1000,
    initialData: options?.initialData,
  });
}
