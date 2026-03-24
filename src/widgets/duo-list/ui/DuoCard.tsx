"use client";

import type { DuoListing } from "@/entities/duo";
import { GAME_TYPE_LABELS } from "@/entities/duo";
import { getChampionImageUrl, getChampionNameByEnglishName } from "@/entities/champion";
import { getPositionImageUrl, getPositionName } from "@/shared/lib/position";
import { getRelativeTime } from "@/shared/lib/date";
import Image from "next/image";

interface DuoCardProps {
  listing: DuoListing;
}

const TIER_COLORS: Record<string, string> = {
  IRON: "text-gray-400",
  BRONZE: "text-amber-700",
  SILVER: "text-gray-300",
  GOLD: "text-yellow-400",
  PLATINUM: "text-teal-300",
  EMERALD: "text-emerald-400",
  DIAMOND: "text-blue-300",
  MASTER: "text-purple-400",
  GRANDMASTER: "text-red-400",
  CHALLENGER: "text-rank-top",
};

const TIER_LABELS: Record<string, string> = {
  IRON: "아이언", BRONZE: "브론즈", SILVER: "실버", GOLD: "골드",
  PLATINUM: "플래티넘", EMERALD: "에메랄드", DIAMOND: "다이아몬드",
  MASTER: "마스터", GRANDMASTER: "그랜드마스터", CHALLENGER: "챌린저",
};

export default function DuoCard({ listing }: DuoCardProps) {
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(listing.tier);
  const tierDisplay = TIER_LABELS[listing.tier] ?? listing.tier;
  const rankDisplay = isMasterPlus ? "" : ` ${listing.rank}`;

  return (
    <div className="bg-surface-1 border border-divider rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Image
            src={getPositionImageUrl(listing.position)}
            alt={getPositionName(listing.position)}
            width={20}
            height={20}
          />
          <span className="font-medium text-on-surface">
            {listing.summonerName}
          </span>
          <span className="text-xs text-on-surface-disabled">#{listing.tagLine}</span>
        </div>
        <span className="text-xs text-on-surface-disabled">
          {getRelativeTime(listing.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-sm font-medium ${TIER_COLORS[listing.tier] ?? "text-on-surface"}`}>
          {tierDisplay}{rankDisplay}
        </span>
        <span className="text-xs bg-surface-4 border border-divider rounded px-2 py-0.5 text-on-surface-medium">
          {GAME_TYPE_LABELS[listing.gameType]}
        </span>
        <span className="text-xs text-on-surface-medium">
          {getPositionName(listing.position)}
        </span>
      </div>

      {listing.champions.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          {listing.champions.map((champ) => (
            <div key={champ} className="relative group">
              <Image
                src={getChampionImageUrl(champ)}
                alt={getChampionNameByEnglishName(champ)}
                width={28}
                height={28}
                className="rounded-full border border-divider"
              />
            </div>
          ))}
        </div>
      )}

      {listing.memo && (
        <p className="text-sm text-on-surface-medium leading-relaxed">
          {listing.memo}
        </p>
      )}
    </div>
  );
}
