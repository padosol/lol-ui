"use client";

import type { SpectatorBannedChampion } from "@/types/spectator";
import { getChampionById } from "@/utils/champion";
import { getChampionImageUrl } from "@/utils/champion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BannedChampionsProps {
  bannedChampions: SpectatorBannedChampion[];
  align?: "left" | "right";
}

interface BannedChampionInfo {
  championId: number;
  teamId: 100 | 200;
  pickTurn: number;
  championName?: string;
}

export default function BannedChampions({
  bannedChampions,
  align = "left",
}: BannedChampionsProps) {
  const [bannedInfo, setBannedInfo] = useState<BannedChampionInfo[]>([]);

  useEffect(() => {
    const loadBannedChampions = async () => {
      const info = await Promise.all(
        bannedChampions.map(async (ban) => {
          if (ban.championId === -1) {
            return {
              ...ban,
              championName: undefined,
            };
          }
          const champion = await getChampionById(ban.championId);
          return {
            ...ban,
            championName: champion?.id, // id 필드 사용 (영문 이름)
          };
        })
      );
      setBannedInfo(info.sort((a, b) => a.pickTurn - b.pickTurn));
    };

    loadBannedChampions();
  }, [bannedChampions]);

  return (
    <div
      className={`flex gap-1.5 flex-wrap ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      {bannedInfo.map((ban, index) => (
        <div
          key={index}
          className="w-10 h-10 rounded overflow-hidden relative border border-gray-600 bg-gray-800"
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
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              없음
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

