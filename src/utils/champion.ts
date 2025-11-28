/**
 * 챔피언 이미지 URL 생성 유틸리티
 */

/**
 * 챔피언명으로 이미지 URL을 생성합니다.
 * @param championName 챔피언 이름 (예: "Aatrox", "Ahri")
 * @returns 챔피언 이미지 URL
 */
export function getChampionImageUrl(championName: string): string {
  if (!championName) {
    return "";
  }
  return `https://static.mmrtr.shop/champion/${championName}.png`;
}

