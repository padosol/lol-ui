/**
 * 프로필 아이콘 이미지 URL 생성 유틸리티
 */

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://static.mmrtr.shop';

/**
 * 프로필 아이콘 ID로 이미지 URL을 생성합니다.
 * @param profileIconId 프로필 아이콘 ID
 * @returns 프로필 아이콘 이미지 URL
 */
export function getProfileIconImageUrl(profileIconId: number): string {
  if (!profileIconId || profileIconId === 0) {
    return "";
  }
  return `${IMAGE_HOST}/profile/${profileIconId}.png`;
}

