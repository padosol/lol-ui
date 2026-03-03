import type { Metadata } from "next";
import { ChampionStatsDetailPageClient } from "@/views/champion-stats";

interface PageProps {
  params: Promise<{ championId: string }>;
  searchParams: Promise<{ tier?: string; patch?: string; platformId?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { championId } = await params;
  return {
    title: `${championId} 챔피언 통계 - METAPICK`,
    description: `${championId}의 승률, 아이템 빌드, 룬, 스킬 트리, 상성 통계를 확인하세요.`,
  };
}

export default async function ChampionStatsDetailPage({ params, searchParams }: PageProps) {
  const { championId } = await params;
  const { tier, patch, platformId } = await searchParams;
  return (
    <ChampionStatsDetailPageClient
      championId={championId}
      initialTier={tier}
      initialPatch={patch}
      initialPlatformId={platformId}
    />
  );
}
