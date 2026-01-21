"use client";

import type { SpectatorParticipant } from "@/types/spectator";
import { getChampionById, getChampionImageUrl } from "@/utils/champion";
import { getPerkImageUrl, getSpellImageUrlAsync } from "@/utils/game";
import Image from "next/image";
import { useEffect, useState } from "react";

interface IngamePlayerProps {
  participant: SpectatorParticipant;
  championName?: string;
}

export default function IngamePlayer({
  participant,
  championName,
}: IngamePlayerProps) {
  const [champId, setChampId] = useState<string>("");
  const [champName, setChampName] = useState<string>("");
  const [spell1Url, setSpell1Url] = useState<string>("");
  const [spell2Url, setSpell2Url] = useState<string>("");

  useEffect(() => {
    const loadChampion = async () => {
      const champion = await getChampionById(participant.championId);
      if (champion) {
        setChampId(champion.id); // 이미지 URL용 (영문 이름)
        setChampName(champion.name); // 표시용 (한글 이름)
      }
    };
    loadChampion();
  }, [participant.championId]);

  useEffect(() => {
    const loadSpellUrls = async () => {
      if (participant.spell1Id > 0) {
        const url = await getSpellImageUrlAsync(participant.spell1Id);
        setSpell1Url(url);
      }
      if (participant.spell2Id > 0) {
        const url = await getSpellImageUrlAsync(participant.spell2Id);
        setSpell2Url(url);
      }
    };
    loadSpellUrls();
  }, [participant.spell1Id, participant.spell2Id]);

  const championImageUrl = champId
    ? getChampionImageUrl(champId)
    : `https://static.mmrtr.shop/champion/${participant.championId}.png`;

  const isBot = !participant.puuid;
  const displayName = isBot
    ? `${participant.riotId} (Bot)`
    : participant.riotId;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-divider bg-surface-4/50 hover:bg-surface-4/70 transition-all shadow-md hover:shadow-lg">
      {/* 챔피언 아이콘 */}
      <div className="w-10 h-10 rounded overflow-hidden relative shrink-0">
        {championImageUrl ? (
          <Image
            src={championImageUrl}
            alt={champId || "Champion"}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-surface-8 flex items-center justify-center text-on-surface-medium text-xs">
            ?
          </div>
        )}
      </div>

      {/* 플레이어 정보 */}
      <div className="flex-1 min-w-0">
        <div className="text-on-surface text-xs font-semibold truncate">
          {displayName}
        </div>
        {champName && (
          <div className="text-on-surface-medium text-[10px] truncate">{champName}</div>
        )}
      </div>

      {/* 스펠 및 룬 */}
      <div className="flex flex-col gap-0.5 shrink-0">
        {/* 스펠 - 가로로 묶기 */}
        <div className="flex gap-0.5">
          {participant.spell1Id > 0 && spell1Url && (
            <div className="w-5 h-5 rounded overflow-hidden relative">
              <Image
                src={spell1Url}
                alt="Spell 1"
                fill
                sizes="20px"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          {participant.spell2Id > 0 && spell2Url && (
            <div className="w-5 h-5 rounded overflow-hidden relative">
              <Image
                src={spell2Url}
                alt="Spell 2"
                fill
                sizes="20px"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        {/* 룬 - 가로로 묶기 */}
        <div className="flex gap-0.5">
          {participant.perks.perkIds.length > 0 && (
            <div className="w-5 h-5 rounded overflow-hidden relative">
              <Image
                src={getPerkImageUrl(participant.perks.perkIds[0])}
                alt="Main Rune"
                fill
                sizes="20px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          {participant.perks.perkSubStyle > 0 && (
            <div className="w-5 h-5 rounded overflow-hidden relative">
              <Image
                src={getPerkImageUrl(participant.perks.perkSubStyle)}
                alt="Sub Rune"
                fill
                sizes="20px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
