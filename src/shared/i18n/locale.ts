export const LOCALES = ["ko", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** 언어 스위처 표시용 라벨 (각 언어 자기 이름으로 표기) */
export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

/** Intl API(날짜·숫자 포맷)용 로케일 */
export const INTL_LOCALE: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
};

/**
 * Data Dragon 로케일.
 * 1차에서는 사용처가 없다 — 게임 데이터는 한국어 고정으로 유지(MP-106).
 * 다국어 게임 데이터 API를 붙일 때 쓸 매핑을 미리 자리만 잡아둔다.
 */
export const DDRAGON_LOCALE: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

/**
 * 라우트 파라미터의 `string` 로케일을 좁힌다.
 * 유효하지 않은 로케일은 proxy/layout 이 이미 걸러내므로
 * 여기서는 기본 로케일로 떨어뜨려 메타데이터 생성이 깨지지 않게만 한다.
 */
export function toLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
