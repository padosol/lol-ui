/**
 * 스타일 이미지 URL 생성 유틸리티
 */

/**
 * 스타일 ID로 이미지 URL을 생성합니다.
 * @param styleId 스타일 ID
 * @returns 스타일 이미지 URL
 */
export function getStyleImageUrl(styleId: number): string {
  if (!styleId || styleId === 0) {
    return "";
  }
  return `https://static.mmrtr.shop/styles/${styleId}.png`;
}

