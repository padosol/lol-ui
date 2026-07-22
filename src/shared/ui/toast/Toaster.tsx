"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * 앱 전역 토스트 컨테이너. `app/layout.tsx` 에 한 번만 마운트한다.
 *
 * 색은 sonner 의 CSS 변수를 디자인 토큰으로 덮어써서 맞춘다.
 * 토큰(`--color-surface-4` 등)이 루트의 `.dark`/`.light` 클래스를 따라 바뀌므로,
 * 테마 스토어를 구독하지 않아도 라이트/다크가 자동으로 따라온다.
 * (shared 레이어는 features/theme-toggle 을 import 할 수 없다 — FSD 의존 방향)
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      duration={3000}
      closeButton
      richColors
      style={
        {
          "--normal-bg": "var(--color-surface-4)",
          "--normal-text": "var(--color-on-surface)",
          "--normal-border": "var(--color-divider)",
          "--success-bg": "var(--color-surface-4)",
          "--success-text": "var(--color-success)",
          "--success-border": "var(--color-divider)",
          "--error-bg": "var(--color-surface-4)",
          "--error-text": "var(--color-error)",
          "--error-border": "var(--color-divider)",
          "--warning-bg": "var(--color-surface-4)",
          "--warning-text": "var(--color-warning)",
          "--warning-border": "var(--color-divider)",
        } as React.CSSProperties
      }
    />
  );
}
