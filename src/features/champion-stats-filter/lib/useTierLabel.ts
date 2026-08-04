"use client";

import { useTranslations } from "next-intl";
import { isTierBase, splitTier } from "./tiers";

/**
 * 티어 값을 현재 언어의 표시 문구로 바꾸는 함수를 돌려준다.
 * "GOLD+" → "골드+" / "Gold+"
 */
export function useTierLabel() {
  const t = useTranslations("domain");

  return (value: string): string => {
    const { base, plus } = splitTier(value);
    if (!isTierBase(base)) return value;
    return `${t(`tier.${base}`)}${plus ? "+" : ""}`;
  };
}
