import { DDRAGON_LOCALE, type Locale } from "@/shared/i18n/locale";

/**
 * 게임 정적 데이터(Data Dragon 파생 JSON) 호스트.
 * 이미지 호스트(IMAGE_HOST)와 물리적으로 같은 CDN 이지만, 이미지는 배포마다 바뀌지 않고
 * 데이터는 패치/언어별로 갈라지므로 오버라이드 지점을 분리해 둔다.
 */
export const GAME_DATA_HOST =
  process.env.NEXT_PUBLIC_GAME_DATA_HOST || "https://static.metapick.me";

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
 * `https://static.metapick.me/data/{패치버전}/{ddragon 로케일}/{파일}`
 * 패치 버전이 없으면 번들 폴백 경로로 떨어진다.
 */
export function gameDataUrl(
  file: GameDataFile,
  patchVersion: string | null | undefined,
  locale: Locale
): string {
  if (!patchVersion) {
    return localGameDataUrl(file);
  }

  return `${GAME_DATA_HOST}/data/${patchVersion}/${DDRAGON_LOCALE[locale]}/${file}`;
}
