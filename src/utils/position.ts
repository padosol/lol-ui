/**
 * 포지션 이미지 URL 생성 유틸리티
 */

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://static.mmrtr.shop';

/**
 * 포지션 이름으로 이미지 URL을 생성합니다.
 * @param position 포지션 이름 (예: "TOP", "JUNGLE", "MID", "ADC", "SUPPORT")
 * @returns 포지션 이미지 URL
 */
export function getPositionImageUrl(position: string): string {
  if (!position || position === "UNKNOWN") {
    return "";
  }
  // 포지션 이름을 대문자로 변환
  const normalizedPosition = position.toUpperCase();
  return `${IMAGE_HOST}/position/${normalizedPosition}.png`;
}

/**
 * 포지션 이름을 한글로 변환합니다.
 * @param position 포지션 이름
 * @returns 한글 포지션 이름
 */
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

const POSITION_ORDER: Record<string, number> = {
  TOP: 0,
  JUNGLE: 1,
  MIDDLE: 2,
  MID: 2,
  BOTTOM: 3,
  ADC: 3,
  UTILITY: 4,
  SUPPORT: 4,
};

/**
 * 참가자 배열을 포지션 순서(탑→정글→미드→봇→서포터)로 정렬합니다.
 */
export function sortByPosition<T extends { teamPosition: string | null }>(
  participants: T[]
): T[] {
  return [...participants].sort((a, b) => {
    const orderA = POSITION_ORDER[(a.teamPosition || '').toUpperCase()] ?? 99;
    const orderB = POSITION_ORDER[(b.teamPosition || '').toUpperCase()] ?? 99;
    return orderA - orderB;
  });
}

