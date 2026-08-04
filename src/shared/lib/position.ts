import { IMAGE_HOST } from "@/shared/config/image";

export function getPositionImageUrl(position: string): string {
  if (!position || position === "UNKNOWN") {
    return "";
  }
  return `${IMAGE_HOST}/position/Position-${position.toUpperCase()}.png`;
}

/** 번역 키로 쓰는 정규화된 포지션. domain.position.* 과 1:1 대응한다. */
export const POSITION_KEYS = [
  "TOP",
  "JUNGLE",
  "MID",
  "ADC",
  "SUPPORT",
  "UNKNOWN",
] as const;

export type PositionKey = (typeof POSITION_KEYS)[number];

/** API 가 내려주는 표기 흔들림(MIDDLE/BOTTOM/UTILITY)을 하나로 모은다. */
const POSITION_ALIASES: Record<string, PositionKey> = {
  TOP: "TOP",
  JUNGLE: "JUNGLE",
  MID: "MID",
  MIDDLE: "MID",
  ADC: "ADC",
  BOTTOM: "ADC",
  SUPPORT: "SUPPORT",
  UTILITY: "SUPPORT",
  UNKNOWN: "UNKNOWN",
};

export function normalizePosition(position: string | null | undefined): PositionKey {
  if (!position) return "UNKNOWN";
  return POSITION_ALIASES[position.toUpperCase()] ?? "UNKNOWN";
}

export const POSITION_ORDER: Record<string, number> = {
  TOP: 0,
  JUNGLE: 1,
  MIDDLE: 2,
  MID: 2,
  BOTTOM: 3,
  ADC: 3,
  UTILITY: 4,
  SUPPORT: 4,
};

export function sortByPosition<T extends { teamPosition: string | null }>(
  participants: T[]
): T[] {
  return [...participants].sort((a, b) => {
    const orderA = POSITION_ORDER[(a.teamPosition || '').toUpperCase()] ?? 99;
    const orderB = POSITION_ORDER[(b.teamPosition || '').toUpperCase()] ?? 99;
    return orderA - orderB;
  });
}
