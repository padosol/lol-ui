# 스타일링 가이드

Tailwind CSS v4 + CSS 변수 기반 토큰. 다크/라이트 동시 지원.

## 토큰 정의 — `src/app/globals.css`

`globals.css` 한 파일에서 두 단계로 토큰을 정의한다.

1. **`:root, html.dark` / `html.light`** 블록 — 원시 CSS 변수 (`--md-*`).
   - Material Design 다크 테마 기반 elevation (`--md-elevation-0` ~ `--md-elevation-24`).
   - 텍스트 불투명도 (`--md-text-high/medium/disabled`), 구분선 (`--md-divider`).
   - 액센트 (`--md-primary/secondary/error/success/warning`).
   - LoL 시맨틱: `--md-win`, `--md-loss`, `--md-team-blue`, `--md-team-red`, `--md-gold`, `--md-rank-top`, `--md-rank-high`.
   - 통계: `--md-stat-low/mid/high/perfect/neutral`.
   - 패치노트 변경유형: `--md-buff`, `--md-nerf`, `--md-adjust`, `--md-info`.

2. **`@theme inline { ... }`** 블록 — 위 변수들을 Tailwind v4 의 `--color-*` 네임스페이스로 노출.
   → Tailwind 가 자동으로 `bg-primary`, `text-on-surface`, `border-divider`, `bg-surface-2`, `text-win`, `text-buff` 같은 유틸리티를 생성한다.

## 사용 규칙

- 유틸리티 우선. 색상은 토큰만 사용 — `bg-[#1E1E1E]` 같은 임의 값 금지.
- 새 색이 필요하면 `globals.css` 의 두 블록(`html.dark` / `html.light`) 모두에 변수를 추가하고 `@theme inline` 에 노출.
- 표면색은 `bg-surface`, `bg-surface-1` … `bg-surface-24` 로 깊이 조절. 카드/팝오버는 보통 `surface-2` ~ `surface-8`.
- 텍스트는 `text-on-surface` (87%) / `text-on-surface-medium` (60%) / `text-on-surface-disabled` (38%).
- 승/패, 팀 색은 반드시 시맨틱 토큰 (`text-win`, `bg-team-blue`) — 직접 색상 코드 X.

## 다크 / 라이트 전환

- 스토어: `src/features/theme-toggle/model/useThemeStore.ts` (Zustand + `persist`, key `theme-storage`, 기본값 `dark`).
- 적용: `src/shared/providers/ThemeProvider.tsx` 가 `<html>` 의 클래스를 `dark` ↔ `light` 로 토글.
- 토글 UI: `src/features/theme-toggle/ui/ThemeToggle.tsx` (`useThemeStore().toggleTheme`).

## 글로벌 애니메이션

`globals.css` 하단에 `pulse-glow` / `fade-in-up` / `float` / `rank-shimmer` / `crown-glow` / `tooltip-fade-in` keyframe + `.animate-*` 유틸 클래스. 페이지 단위 애니메이션은 컴포넌트 안에서 정의하고 글로벌은 재사용 가능한 것만.

## 같이 보기

- [컴포넌트 작성 가이드](./component-guide.md) — UI 프리미티브는 `shared/ui/` 에
- [개발 가이드](./development-guide.md) — `pnpm dev` 로 핫 리로드
