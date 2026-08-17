import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "./locale";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // 모든 언어에 prefix를 붙인다 (/ko/..., /en/...)
  localePrefix: "always",
  // URL prefix → NEXT_LOCALE 쿠키 → accept-language → defaultLocale 순으로 결정
  localeDetection: true,
});
