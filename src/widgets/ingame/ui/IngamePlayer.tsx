"use client";

import { GameTooltip } from "@/shared/ui/tooltip";
import type { SpectatorParticipant } from "@/entities/spectator";
import { getChampionImageUrl, useChampionById } from "@/entities/champion";
import { getPerkImageUrl, getSpellImageUrl } from "@/shared/lib/game";
import { useGameDataStore } from "@/shared/model/game-data";
import Image from "next/image";
import { useMemo } from "react";

interface IngamePlayerProps {
  participant: SpectatorParticipant;
}

export default function IngamePlayer({
  participant,
}: IngamePlayerProps) {
  const champion = useChampionById(participant.championId);
  const champId = champion?.id ?? ""; // 이미지 URL용 (영문 이름)
  const champName = champion?.name ?? ""; // 표시용 (한글 이름)

  // getSpellImageUrl은 store.getState() 간접참조라 비반응형 → summonerData 구독으로 hydration 갱신
  const summonerData = useGameDataStore((s) => s.summonerData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const spell1Url = useMemo(() => getSpellImageUrl(participant.spell1Id), [participant.spell1Id, summonerData]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const spell2Url = useMemo(() => getSpellImageUrl(participant.spell2Id), [participant.spell2Id, summonerData]);

  const championImageUrl = champId
    ? getChampionImageUrl(champId)
    : `https://static.metapick.me/champion/${participant.championId}.png`;

  const perks = participant.perks;
  const mainPerkId = perks?.perkIds?.[0];
  const subPerkStyleId = perks?.perkSubStyle;
  const baseDisplayName = participant.riotId || participant.summonerName;
  const displayName = participant.isBot
    ? `${baseDisplayName} (Bot)`
    : baseDisplayName;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-divider bg-surface-4/50 hover:bg-surface-4/70 transition-all shadow-md hover:shadow-lg">
      {/* 챔피언 아이콘 */}
      <GameTooltip type="champion" id={champId} disabled={!champId}>
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
      </GameTooltip>

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
            <GameTooltip type="spell" id={participant.spell1Id}>
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
            </GameTooltip>
          )}
          {participant.spell2Id > 0 && spell2Url && (
            <GameTooltip type="spell" id={participant.spell2Id}>
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
            </GameTooltip>
          )}
        </div>
        {/* 룬 - 가로로 묶기 */}
        <div className="flex gap-0.5">
          {mainPerkId && (
            <GameTooltip type="rune" id={mainPerkId}>
              <div className="w-5 h-5 rounded overflow-hidden relative">
                <Image
                  src={getPerkImageUrl(mainPerkId)}
                  alt="Main Rune"
                  fill
                  sizes="20px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </GameTooltip>
          )}
          {subPerkStyleId && subPerkStyleId > 0 && (
            <GameTooltip type="rune" id={subPerkStyleId}>
              <div className="w-5 h-5 rounded overflow-hidden relative">
                <Image
                  src={getPerkImageUrl(subPerkStyleId)}
                  alt="Sub Rune"
                  fill
                  sizes="20px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </GameTooltip>
          )}
        </div>
      </div>
    </div>
  );
}
