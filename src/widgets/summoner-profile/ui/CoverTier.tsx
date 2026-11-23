"use client";

import type { LeagueData } from "@/entities/league";
import { getTierImageUrl } from "@/shared/lib/tier";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { formatTierLabel } from "../lib/profileCover";

interface CoverTierProps {
  /** null 이면 솔로·자유 모두 배치 전(언랭크). 자리를 비우지 않고 UNRANKED 로 채운다. */
  league: LeagueData | null;
}

/** 프로필 커버의 티어 블록. 솔로 랭크 우선, 없으면 자유 랭크. */
export default function CoverTier({ league }: Readonly<CoverTierProps>) {
  const t = useTranslations("league");
  const tDomain = useTranslations("domain");

  const queueName =
    league?.leagueType === "RANKED_FLEX_SR"
      ? tDomain("leagueType.RANKED_FLEX_SR")
      : tDomain("leagueType.RANKED_SOLO_5x5");
  const tierImageUrl = league ? getTierImageUrl(league.tier) : "";

  return (
    <div className="flex items-center gap-3 md:gap-3.5">
      {league && tierImageUrl && (
        <div className="relative w-13 h-13 md:w-[68px] md:h-[68px] shrink-0">
          <Image
            src={tierImageUrl}
            alt={t("tierAlt", { tier: league.tier })}
            fill
            sizes="68px"
            className="object-contain"
            unoptimized
          />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xl md:text-2xl font-extrabold leading-tight tracking-[0.08em] text-on-surface whitespace-nowrap">
          {league ? formatTierLabel(league.tier, league.rank) : "UNRANKED"}
        </div>
        <div className="mt-0.5 text-sm md:text-[15px] font-medium text-on-surface-medium whitespace-nowrap tabular-nums">
          {league ? `${league.leaguePoints} LP · ${queueName}` : queueName}
        </div>
      </div>
    </div>
  );
}
