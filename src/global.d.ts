import type messages from "@/shared/i18n/messages/ko.json";
import type { Locale } from "@/shared/i18n/locale";

/**
 * next-intl 타입 보강.
 * ko.json 이 기준(source of truth)이라 t("없는키") 가 컴파일 에러가 된다.
 */
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
    Locale: Locale;
  }
}
