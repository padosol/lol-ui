/**
 * 프로필 아이콘 이미지 URL 생성 유틸리티
 */

/**
 * 프로필 아이콘 ID로 이미지 URL을 생성합니다.
 * @param profileIconId 프로필 아이콘 ID
 * @returns 프로필 아이콘 이미지 URL
 */
export function getProfileIconImageUrl(profileIconId: number): string {
  if (!profileIconId || profileIconId === 0) {
    return "";
  }
  return `https://static.mmrtr.shop/profile/${profileIconId}.png`;
}

