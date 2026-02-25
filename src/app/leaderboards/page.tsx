import type { Metadata } from "next";
import LeaderboardsPageClient from "./LeaderboardsPageClient";

export const metadata: Metadata = {
  title: "랭킹, 천상계 커트라인 | METAPICK.ME",
  description: "리그 오브 레전드 솔로 랭크 랭킹, 천상계 커트라인을 확인하세요.",
};

export default function LeaderboardsPage() {
  return <LeaderboardsPageClient />;
}
