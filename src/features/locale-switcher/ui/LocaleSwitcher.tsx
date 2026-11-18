"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/shared/i18n/locale";
import { useClickOutside } from "@/shared/lib/useClickOutside";

export function LocaleSwitcher() {
  const activeLocale = useLocale() as Locale;
  const router = useRouter();
  // 로케일 prefix 가 제거된 현재 경로 — 언어만 바꿔 같은 화면으로 이동한다
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  function handleSelect(nextLocale: Locale) {
    setOpen(false);
    if (nextLocale === activeLocale) return;

    // useSearchParams() 를 쓰면 이 컴포넌트가 헤더를 통해 전 페이지에 퍼지면서
    // 정적 생성이 CSR 로 bail out 된다. 렌더 중이 아닌 클릭 시점에 읽어 회피한다.
    const search = typeof window === "undefined" ? "" : window.location.search;
    const href = `${pathname}${search}`;

    // 쿠키(NEXT_LOCALE)는 next-intl 이 갱신한다
    startTransition(() => {
      router.replace(href, { locale: nextLocale });
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* 헤더 바와 메뉴가 bg-surface-4 라 hover 는 한 단계 밝은 surface-12 로 준다 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        className="flex items-center gap-1 h-9 px-2 rounded-lg text-on-surface-medium hover:bg-surface-12 hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
        // 화면엔 코드(KO)만 보이므로 보조기기에는 언어 이름으로 알린다
        aria-label={t("current", { language: LOCALE_LABELS[activeLocale] })}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-wide">
          {activeLocale.toUpperCase()}
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 mt-2 min-w-40 rounded-lg bg-surface-4 border border-divider shadow-lg p-1 z-50"
        >
          {LOCALES.map((locale) => {
            const selected = locale === activeLocale;
            return (
              <li key={locale}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  lang={locale}
                  onClick={() => handleSelect(locale)}
                  className={`flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-md text-sm cursor-pointer hover:bg-surface-12 transition-colors ${
                    selected
                      ? "text-primary font-medium"
                      : "text-on-surface-medium hover:text-on-surface"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="w-5 text-[11px] font-medium tracking-wide text-on-surface-disabled"
                  >
                    {locale.toUpperCase()}
                  </span>
                  {LOCALE_LABELS[locale]}
                  {selected && <Check className="w-4 h-4 ml-auto" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
