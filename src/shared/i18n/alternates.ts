import { LOCALES, DEFAULT_LOCALE, type Locale } from "./locale";

export const SITE_URL = "https://metapick.me";

/**
 * 로케일별 canonical + hreflang 을 만든다.
 *
 * `path` 는 로케일 prefix 를 뺀 경로(`/champion-stats`, 홈은 `""`).
 * localePrefix 가 "always" 이므로 모든 언어에 prefix 를 붙이고,
 * x-default 는 기본 로케일(ko)로 보낸다.
 */
export function localeAlternates(locale: string, path = "") {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
  ) as Record<Locale, string>;

  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: {
      ...languages,
      "x-default": `${SITE_URL}/${DEFAULT_LOCALE}${path}`,
    },
  };
}
