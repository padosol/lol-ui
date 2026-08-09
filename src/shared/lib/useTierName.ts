"use client";

import { useTranslations } from "next-intl";

/** messages 의 domain.tier 키. 서버가 내려주는 티어 문자열과 1:1 대응한다. */
const TIER_KEYS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
  "UNRANKED",
] as const;

type TierKey = (typeof TIER_KEYS)[number];

function isTierKey(value: string): value is TierKey {
  return (TIER_KEYS as readonly string[]).includes(value);
}

/** 티어 코드를 현재 로케일의 표시 이름으로 바꾸는 함수를 돌려준다. */
export function useTierName() {
  const t = useTranslations("domain.tier");

  return (tier: string): string => {
    const key = tier.toUpperCase();
    return isTierKey(key) ? t(key) : tier;
  };
}
