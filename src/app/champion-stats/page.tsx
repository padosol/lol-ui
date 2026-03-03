import type { Metadata } from "next";
import { ChampionStatsPageClient } from "@/views/champion-stats";

export const metadata: Metadata = {
  title: "챔피언 분석 - METAPICK",
  description:
    "포지션별 챔피언 게임수를 확인하고, 챔피언을 클릭하여 상세 통계를 확인하세요.",
};

export default function ChampionStatsPage() {
  return <ChampionStatsPageClient />;
}
