"use client";

import type { ChampionPositionStats } from "@/types/championStats";
import {
  getChampionImageUrl,
  getChampionNameByEnglishName,
} from "@/utils/champion";
import Image from "next/image";

const TIER_COLORS: Record<string, string> = {
  OP: "bg-red-500 text-white",
  "1": "bg-orange-500 text-white",
  "2": "bg-yellow-500 text-surface",
  "3": "bg-green-500 text-white",
  "4": "bg-blue-500 text-white",
  "5": "bg-gray-500 text-white",
};

interface ChampionOverviewProps {
  data: ChampionPositionStats;
  tier: string;
  championId: string;
}

export default function ChampionOverview({
  data,
  tier,
  championId,
}: ChampionOverviewProps) {
  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <div className="flex items-center gap-4 mb-5">
        <Image
          src={getChampionImageUrl(championId)}
          alt={championId}
          width={64}
          height={64}
          className="rounded-lg"
          unoptimized
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-on-surface">
              {getChampionNameByEnglishName(championId)}
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                TIER_COLORS[tier] || TIER_COLORS["5"]
              }`}
            >
              {tier === "OP" ? "OP" : `Tier ${tier}`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="승률"
          value={`${data.winRate.toFixed(1)}%`}
          valueClass={data.winRate >= 50 ? "text-win" : "text-loss"}
        />
        <StatCard
          label="승리"
          value={Math.round(data.totalCount * data.winRate / 100).toLocaleString()}
        />
        <StatCard
          label="게임수"
          value={data.totalCount.toLocaleString()}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass = "text-on-surface",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-surface rounded-lg p-4 text-center">
      <p className="text-on-surface-medium text-xs mb-1">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
