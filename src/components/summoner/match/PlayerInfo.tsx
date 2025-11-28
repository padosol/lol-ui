"use client";

import {
  getItemImageUrl,
  getKDAColorClass,
  getSpellImageUrl,
} from "@/utils/game";
import { getPositionName } from "@/utils/position";
import Image from "next/image";

interface PlayerInfoProps {
  champion: string;
  championIcon: string;
  position: string;
  champLevel: number;
  summoner1Id: number;
  summoner2Id: number;
  items: number[];
  kda: {
    kills: number;
    deaths: number;
    assists: number;
  };
  kdaRating: string;
  isArena?: boolean;
}

export default function PlayerInfo({
  champion,
  championIcon,
  position,
  champLevel,
  summoner1Id,
  summoner2Id,
  items,
  kda,
  kdaRating,
  isArena = false,
}: PlayerInfoProps) {
  return (
    <div className="space-y-3">
      {/* 챔피언 포트레이트 */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 bg-gray-700 rounded-full overflow-hidden relative">
          {championIcon ? (
            <Image
              src={championIcon}
              alt={champion}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-4xl">🎮</span>
          )}
        </div>
        {/* 챔피언 레벨 */}
        {champLevel > 0 && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center border-2 border-gray-600">
            <span className="text-white text-xs font-bold">{champLevel}</span>
          </div>
        )}
      </div>

      {/* 챔피언 정보 (일반 모드에서만 표시) */}
      {!isArena && (
        <div className="text-center">
          <div className="text-white font-semibold text-sm">{champion}</div>
          <div className="text-gray-400 text-xs">
            {getPositionName(position)}
          </div>
        </div>
      )}

      {/* 소환사 주문 및 룬 (2x2 그리드) */}
      <div className="grid grid-cols-2 gap-1 max-w-[60px] mx-auto">
        {summoner1Id > 0 && (
          <div className="w-7 h-7 bg-gray-700 rounded overflow-hidden relative">
            <Image
              src={getSpellImageUrl(summoner1Id)}
              alt="Spell 1"
              fill
              sizes="28px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        {summoner2Id > 0 && (
          <div className="w-7 h-7 bg-gray-700 rounded overflow-hidden relative">
            <Image
              src={getSpellImageUrl(summoner2Id)}
              alt="Spell 2"
              fill
              sizes="28px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        {/* 룬은 style에서 추출 필요 (추후 구현) */}
        <div className="w-7 h-7 bg-gray-700 rounded"></div>
        <div className="w-7 h-7 bg-gray-700 rounded"></div>
      </div>

      {/* KDA (일반 모드에서만 표시) */}
      {!isArena && (
        <div className="text-center">
          <div className="text-white font-semibold text-sm">
            {kda.kills} / <span className="text-red-400">{kda.deaths}</span> /{" "}
            {kda.assists}
          </div>
          <div className="text-xs">
            <span className={getKDAColorClass(kdaRating)}>
              {kdaRating} 평점
            </span>
          </div>
        </div>
      )}

      {/* 아이템 (일반 모드에서만 표시, 6개 + 와드) */}
      {!isArena && (
        <div className="flex gap-0.5 justify-center flex-wrap max-w-[200px] mx-auto">
          {items.slice(0, 6).map((itemId, idx) => (
            <div
              key={idx}
              className="w-6 h-6 bg-gray-700 rounded overflow-hidden relative"
            >
              {itemId > 0 ? (
                <Image
                  src={getItemImageUrl(itemId)}
                  alt={`Item ${itemId}`}
                  fill
                  sizes="24px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800"></div>
              )}
            </div>
          ))}
          {/* 와드 슬롯 */}
          {items[6] > 0 && (
            <div className="w-6 h-6 bg-gray-700 rounded overflow-hidden relative">
              <Image
                src={getItemImageUrl(items[6])}
                alt="Ward"
                fill
                sizes="24px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
