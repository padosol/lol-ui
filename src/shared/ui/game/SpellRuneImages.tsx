"use client";

import { getSpellImageUrlAsync } from "@/shared/lib/game";
import { GameTooltip } from "@/shared/ui/tooltip";
import Image from "next/image";
import { useEffect, useState } from "react";

// 소환사 주문 이미지 컴포넌트 (비동기 로드)
export function SummonerSpellImage({ spellId, small, size }: { spellId: number; small?: boolean; size?: "default" | "small" | "xs" | "2xs" }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const resolvedSize = size ?? (small ? "small" : "default");
  const sizeClass = { "2xs": "w-3.5 h-3.5", xs: "w-[18px] h-[18px]", small: "w-6 h-6", default: "w-7 h-7" }[resolvedSize];
  const imgSize = { "2xs": 14, xs: 18, small: 24, default: 28 }[resolvedSize];

  useEffect(() => {
    if (spellId > 0) {
      getSpellImageUrlAsync(spellId).then(setImageUrl).catch(() => { });
    }
  }, [spellId]);

  if (!imageUrl) {
    return null;
  }

  return (
    <GameTooltip type="spell" id={spellId}>
      <div className={`${sizeClass} bg-surface-4 rounded border border-divider/50 overflow-hidden relative shadow-sm flex items-center justify-center`}>
        <Image
          src={imageUrl}
          alt={`Summoner ${spellId}`}
          width={imgSize}
          height={imgSize}
          className="object-cover"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
    </GameTooltip>
  );
}

// 룬 이미지 컴포넌트 (소환사 주문과 동일한 스타일)
export function RuneImage({ runeId, imageUrl, small, size }: { runeId: number; imageUrl: string; small?: boolean; size?: "default" | "small" | "xs" | "2xs" }) {
  const resolvedSize = size ?? (small ? "small" : "default");
  const sizeClass = { "2xs": "w-3.5 h-3.5", xs: "w-[18px] h-[18px]", small: "w-6 h-6", default: "w-7 h-7" }[resolvedSize];
  const imgSize = { "2xs": 14, xs: 18, small: 24, default: 28 }[resolvedSize];

  if (!imageUrl) {
    return null;
  }

  return (
    <GameTooltip type="rune" id={runeId}>
      <div className={`${sizeClass} bg-surface-4 rounded border border-divider/50 overflow-hidden relative shadow-sm flex items-center justify-center`}>
        <Image
          src={imageUrl}
          alt={`Rune ${runeId}`}
          width={imgSize}
          height={imgSize}
          className="object-cover"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
    </GameTooltip>
  );
}
