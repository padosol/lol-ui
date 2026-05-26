"use client";

import type { SpectatorBannedChampion } from "@/entities/spectator";
import { useChampionsByIds } from "@/entities/champion";
import { getChampionImageUrl } from "@/entities/champion";
import Image from "next/image";
import { useMemo } from "react";

interface BannedChampionsProps {
  bannedChampions: SpectatorBannedChampion[];
  align?: "left" | "right";
}

interface BannedChampionInfo {
  championId: number;
  teamId: number;
  pickTurn: number;
  championName?: string;
}

export default function BannedChampions({
  bannedChampions,
  align = "left",
}: BannedChampionsProps) {
  const championIds = useMemo(
    () =>
      bannedChampions
        .filter((ban) => ban.championId !== -1)
        .map((ban) => ban.championId),
    [bannedChampions]
  );
  const champions = useChampionsByIds(championIds);

  const championByKey = useMemo(() => {
    const map = new Map<string, (typeof champions)[number]>();
    for (const champion of champions) {
      map.set(champion.key, champion);
    }
    return map;
  }, [champions]);

  const bannedInfo = useMemo<BannedChampionInfo[]>(() => {
    const info = bannedChampions.map((ban) => {
      if (ban.championId === -1) {
        return {
          ...ban,
          championName: undefined,
        };
      }
      const champion = championByKey.get(String(ban.championId));
      return {
        ...ban,
        championName: champion?.id, // id 필드 사용 (영문 이름)
      };
    });
    return info.sort((a, b) => a.pickTurn - b.pickTurn);
  }, [bannedChampions, championByKey]);

  return (
    <div
      className={`flex gap-1.5 flex-wrap ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      {bannedInfo.map((ban, index) => (
        <div
          key={index}
          className="w-10 h-10 rounded overflow-hidden relative border border-divider bg-surface-4"
        >
          {ban.championId !== -1 && ban.championName ? (
            <Image
              src={getChampionImageUrl(ban.championName)}
              alt={ban.championName}
              fill
              sizes="40px"
              className="object-cover opacity-50"
              unoptimized
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-disabled text-xs">
              없음
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
