import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverApiClient } from "@/shared/api/server-client";
import { getChampionStats, getChampionImageUrl } from "@/entities/champion";
import { getChampionKeyFromId } from "@/entities/champion/lib/serverChampionData";
import { getSeasons } from "@/entities/season";
import { logger } from "@/shared/lib/logger";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import { ChampionStatsDetailPageClient } from "@/views/champion-stats";

interface PageProps {
  params: Promise<{ locale: string; championId: string }>;
  searchParams: Promise<{ tier?: string; patch?: string; platformId?: string }>;
}

async function resolveLatestPatch(): Promise<string | null> {
  try {
    const seasons = await getSeasons(serverApiClient);
    if (seasons.length === 0) return null;
    const latestSeason = seasons.reduce((latest, s) =>
      s.seasonValue > latest.seasonValue ? s : latest
    );
    return latestSeason.patchVersions[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, championId } = await params;
  const championInfo = await getChampionKeyFromId(championId);
  const championName = championInfo?.name ?? championId;
  const imageUrl = getChampionImageUrl(championId);

  const t = await getTranslations({ locale: toLocale(locale), namespace: "meta.championDetail" });
  const title = t("title", { champion: championName });
  const description = t("description", { champion: championName });

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/champion-stats/${championId}`),
    openGraph: {
      title,
      description,
      ...(imageUrl && { images: [{ url: imageUrl }] }),
      type: "website",
      siteName: "METAPICK",
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ChampionStatsDetailPage({ params, searchParams }: PageProps) {
  const { championId } = await params;
  const { tier, patch, platformId } = await searchParams;

  const championInfo = await getChampionKeyFromId(championId);
  if (!championInfo) {
    notFound();
  }

  const { key: championKey } = championInfo;
  const region = platformId || "kr";
  const selectedTier = tier || "CHALLENGER";

  let activePatch = patch || "";
  if (!activePatch) {
    const latestPatch = await resolveLatestPatch();
    if (!latestPatch) {
      return (
        <ChampionStatsDetailPageClient
          championId={championId}
          championKey={championKey}
          initialTier={tier}
          initialPatch={patch}
          initialPlatformId={platformId}
        />
      );
    }
    activePatch = latestPatch;
  }

  let initialStatsData = null;
  try {
    initialStatsData = await getChampionStats(
      region,
      championKey,
      activePatch,
      selectedTier,
      serverApiClient
    );
  } catch (error) {
    logger.error("Failed to load champion stats server-side", {
      url: `/champion-stats/${championId}`,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return (
    <ChampionStatsDetailPageClient
      championId={championId}
      championKey={championKey}
      initialTier={tier}
      initialPatch={patch}
      initialPlatformId={platformId}
      initialActivePatch={activePatch}
      initialStatsData={initialStatsData}
    />
  );
}
