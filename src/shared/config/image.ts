export const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'https://static.metapick.me';

/**
 * Riot 공식 Data Dragon 이미지 경로.
 * 스플래시·로딩 화면 일러스트는 IMAGE_HOST(CDN)에 올려 두지 않아 여기서 바로 받는다.
 * 일러스트 경로에는 패치 버전이 들어가지 않는다.
 */
export const DDRAGON_IMAGE_HOST = 'https://ddragon.leagueoflegends.com/cdn/img';
