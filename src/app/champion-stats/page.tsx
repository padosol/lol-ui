import type { Metadata } from "next";
import ChampionStatsPageClient from "./ChampionStatsPageClient";

export const metadata: Metadata = {
  title: "챔피언 통계 - METAPICK",
  description:
    "리그 오브 레전드 챔피언별 승률, 아이템 빌드, 룬, 스킬 트리, 상성 통계를 확인하세요.",
};

export default function ChampionStatsPage() {
  return <ChampionStatsPageClient />;
}
