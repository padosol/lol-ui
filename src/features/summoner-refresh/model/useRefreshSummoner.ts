import { renewSummoner } from "@/entities/summoner";
import { useMutation } from "@tanstack/react-query";

export function useRefreshSummonerData() {
  return useMutation({
    mutationFn: ({ puuid }: { puuid: string }) => renewSummoner(puuid),
  });
}
