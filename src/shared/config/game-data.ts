import { type Locale } from "@/shared/i18n/locale";

/**
 * 게임 정적 데이터(Data Dragon 파생 JSON) 호스트.
 * 이미지 호스트(IMAGE_HOST)와 물리적으로 같은 CDN 이지만, 이미지는 배포마다 바뀌지 않고
 * 데이터는 패치/언어별로 갈라지므로 오버라이드 지점을 분리해 둔다.
 */
export const GAME_DATA_HOST =
  process.env.NEXT_PUBLIC_GAME_DATA_HOST || "https://static.metapick.me";

/**
 * CDN 을 직접 치지 않고 Next 리라이트로 우회할 때 쓰는 경로 접두사.
 * `next.config.ts` 의 rewrites source 와 짝을 이룬다 — 한쪽만 바꾸면 404 가 난다.
 */
export const GAME_DATA_PROXY_PREFIX = "/game-data";

/**
 * CDN 요청을 같은 출처로 우회할지 여부 (`NEXT_PUBLIC_GAME_DATA_PROXY=true`).
 *
 * 데이터 JSON 은 `fetch` 로 받으므로 CDN 이 `Access-Control-Allow-Origin` 을 내려줘야 한다
 * (이미지는 `<img>` 로 로드해 CORS 가 필요 없어 같은 CDN 인데도 문제가 없다).
 * 그 헤더를 붙이는 CloudFront 응답 헤더 정책이 없는 환경(로컬 개발)에서는 이 값을 켜서
 * Next 서버가 대신 받아오게 한다 — 같은 출처가 되어 CORS 자체가 성립하지 않는다.
 * 운영은 CloudFront 가 헤더를 붙이므로 꺼 둔다 (프록시 홉이 없어야 CDN 캐시를 그대로 탄다).
 */
export const USE_GAME_DATA_PROXY =
  process.env.NEXT_PUBLIC_GAME_DATA_PROXY === "true";

export const GAME_DATA_FILES = {
  champion: "championFull.json",
  summoner: "summoner.json",
  item: "item.json",
  rune: "runesReforged.json",
} as const;

export type GameDataFile = (typeof GAME_DATA_FILES)[keyof typeof GAME_DATA_FILES];

/**
 * 패치 버전을 아직 모를 때 쓰는 번들 폴백 경로 (`public/data/*.json`).
 * 시즌 API 가 늦거나 실패해도 툴팁/스펠 이름이 빈 채로 남지 않게 한다.
 */
export function localGameDataUrl(file: GameDataFile): string {
  return `/data/${file}`;
}

/**
 * `https://static.metapick.me/data/{패치버전}/{로케일}/{파일}`
 * 로케일 디렉토리는 `ko`/`en`/`ja` 처럼 앱 로케일 코드를 그대로 쓴다
 * (Data Dragon 의 `ko_KR` 형식이 아니다).
 * 패치 버전이 없으면 번들 폴백 경로로 떨어진다.
 * 프록시를 켜면 호스트 대신 `/game-data/…` 로 나가고 Next 리라이트가 같은 경로로 넘긴다.
 */
export function gameDataUrl(
  file: GameDataFile,
  patchVersion: string | null | undefined,
  locale: Locale
): string {
  if (!patchVersion) {
    return localGameDataUrl(file);
  }

  const base = USE_GAME_DATA_PROXY
    ? GAME_DATA_PROXY_PREFIX
    : `${GAME_DATA_HOST}/data`;

  return `${base}/${patchVersion}/${locale}/${file}`;
}
