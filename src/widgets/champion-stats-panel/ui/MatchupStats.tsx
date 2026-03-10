"use client";

import { useGameDataStore } from "@/shared/model/game-data";
import type { MatchupData } from "@/entities/champion";
import { getChampionImageUrl } from "@/entities/champion";
import Image from "next/image";
import { useMemo } from "react";

interface MatchupStatsProps {
  data: MatchupData[];
}

export default function MatchupStats({ data }: MatchupStatsProps) {
  const bestMatchups = useMemo(
    () =>
      [...data]
        .filter((m) => m.winRate != null && m.games != null && m.opponentChampionId != null)
        .filter((m) => m.winRate >= 0.5)
        .sort((a, b) => b.winRate - a.winRate),
    [data]
  );

  const worstMatchups = useMemo(
    () =>
      [...data]
        .filter((m) => m.winRate != null && m.games != null && m.opponentChampionId != null)
        .filter((m) => m.winRate < 0.5)
        .sort((a, b) => a.winRate - b.winRate),
    [data]
  );

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-5">
      <h3 className="text-base font-bold text-on-surface mb-4">상대 상성</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MatchupColumn
          title="유리한 상대"
          entries={bestMatchups}
          type="best"
        />
        <MatchupColumn
          title="불리한 상대"
          entries={worstMatchups}
          type="worst"
        />
      </div>
    </div>
  );
}

function MatchupColumn({
  title,
  entries,
  type,
}: {
  title: string;
  entries: MatchupData[];
  type: "best" | "worst";
}) {
  const championData = useGameDataStore((s) => s.championData);
  const colorClass = type === "best" ? "text-win" : "text-loss";

  // key(숫자 문자열) → { id, name } 역매핑 (O(1) 조회용)
  const championByKey = useMemo(() => {
    if (!championData?.data) return new Map<string, { id: string; name: string }>();
    const map = new Map<string, { id: string; name: string }>();
    for (const c of Object.values(championData.data)) {
      map.set(c.key, { id: c.id, name: c.name });
    }
    return map;
  }, [championData]);

  const getChampionInfo = (opponentId: number) => {
    const fallback = { id: String(opponentId), name: String(opponentId) };
    return championByKey.get(String(opponentId)) ?? fallback;
  };

  return (
    <div>
      <h4 className={`text-sm font-medium mb-2 ${colorClass}`}>{title}</h4>
      <div className="space-y-1.5">
        {entries.map((entry) => {
          const champ = getChampionInfo(entry.opponentChampionId);
          return (
            <div
              key={entry.opponentChampionId}
              className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2"
            >
              <Image
                src={getChampionImageUrl(champ.id)}
                alt={champ.name}
                width={32}
                height={32}
                className="rounded"
                unoptimized
              />
              <span className="text-sm text-on-surface truncate min-w-0 flex-1">
                {champ.name}
              </span>

              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-4 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      type === "best" ? "bg-win" : "bg-loss"
                    }`}
                    style={{ width: `${entry.winRate * 100}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium w-12 text-right ${colorClass}`}
                >
                  {(entry.winRate * 100).toFixed(1)}%
                </span>
              </div>

              <span className="text-xs text-on-surface-medium w-14 text-right">
                {entry.games.toLocaleString()}게임
              </span>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-center text-on-surface-medium text-sm py-4">
            데이터 없음
          </p>
        )}
      </div>
    </div>
  );
}
