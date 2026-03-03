import { renewSummoner } from "@/entities/summoner";
import { useMutation } from "@tanstack/react-query";

export function useRefreshSummonerData() {
  return useMutation({
    mutationFn: ({ platform, puuid }: { platform: string; puuid: string }) =>
      renewSummoner(platform, puuid),
  });
}
