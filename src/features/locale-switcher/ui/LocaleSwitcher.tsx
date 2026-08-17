"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
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
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        className="p-2 rounded-lg hover:bg-surface-4 transition-colors cursor-pointer disabled:opacity-50"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages className="w-5 h-5 text-on-surface-medium" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 mt-2 min-w-32 rounded-lg bg-surface-4 border border-divider shadow-lg py-1 z-50"
        >
          {LOCALES.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === activeLocale}
                onClick={() => handleSelect(locale)}
                className={`w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-surface-4 transition-colors ${
                  locale === activeLocale
                    ? "text-primary font-medium"
                    : "text-on-surface-medium"
                }`}
              >
                {LOCALE_LABELS[locale]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
