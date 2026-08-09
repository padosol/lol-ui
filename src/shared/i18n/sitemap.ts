import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "./locale";
import { SITE_URL } from "./alternates";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * 로케일 prefix 를 뺀 경로 하나를 로케일 수만큼의 사이트맵 항목으로 펼친다.
 * 각 항목에는 나머지 로케일을 가리키는 hreflang(alternates.languages)을 붙인다.
 */
export function localizedSitemapEntries(
  path: string,
  lastModified: Date
): SitemapEntry[] {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
  );

  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified,
    alternates: {
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/${DEFAULT_LOCALE}${path}`,
      },
    },
  }));
}
