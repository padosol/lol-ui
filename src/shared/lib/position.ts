import { IMAGE_HOST } from "@/shared/config/image";

export function getPositionImageUrl(position: string): string {
  if (!position || position === "UNKNOWN") {
    return "";
  }
  const normalizedPosition = position.toUpperCase();
  return `${IMAGE_HOST}/position/Position-${normalizedPosition}.png`;
}

export function getPositionName(position: string): string {
  const positionMap: Record<string, string> = {
    TOP: "탑",
    JUNGLE: "정글",
    MID: "미드",
    MIDDLE: "미드",
    ADC: "원딜",
    BOTTOM: "원딜",
    SUPPORT: "서포터",
    UNKNOWN: "알 수 없음",
  };
  return positionMap[position.toUpperCase()] || position;
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
