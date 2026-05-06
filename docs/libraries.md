# 라이브러리 / 의존성

`package.json` 기준. 각 줄의 마지막은 "**왜 / 언제 쓰지 마라**".

## Framework / 언어

| 라이브러리 | 용도 | 메모 |
| --- | --- | --- |
| `next@16` (App Router) | SSR / 라우팅 / 빌드 | App Router 만 사용. Pages Router 신규 추가 X |
| `react@19`, `react-dom@19` | UI | Server / Client 컴포넌트 분리 — 기본은 server |
| `typescript@5` | 타입 | `strict: true`. `any` 금지. `paths: @/* → ./src/*` |

## 데이터 / 상태

| 라이브러리 | 용도 | 왜 / 언제 쓰지 마라 |
| --- | --- | --- |
| `@tanstack/react-query@5` | 서버 데이터 캐싱·동기화 | 비동기 서버 데이터는 React Query 가 단일 출구. 단순 클라 상태에는 X (그건 Zustand). 캐시 키는 `entities/*/model/` 안에 정의 |
| `zustand@5` | 클라이언트 전역 상태 | 글로벌 UI 상태 (테마, 게임 데이터 캐시 등). 서버 데이터에는 X — React Query 와 역할 분리 유지 |
| `axios@1` | HTTP 클라이언트 | 인터셉터로 401 토큰 갱신 + 로깅. fetch 직접 호출 대신 `shared/api/client.ts` (브라우저) / `server-client.ts` (서버) 사용 |
| `zod@4` | 스키마 검증 | 폼 검증 + 외부 입력 파싱. 내부 타입 합성용으로는 과함 |
| `react-hook-form@7` + `@hookform/resolvers` | 폼 상태 | 폼 컴포넌트는 RHF + Zod resolver 패턴. 단일 input 토글 같은 사소한 폼은 그냥 `useState` |

## UI / 시각화

| 라이브러리 | 용도 | 메모 |
| --- | --- | --- |
| `tailwindcss@4` (+ `@tailwindcss/postcss`) | 스타일링 | 토큰은 `globals.css` `@theme inline` 블록. 자세한 룰은 [styling-guide.md](./styling-guide.md) |
| `lucide-react` | 아이콘 | SVG 아이콘은 lucide 를 우선. 커스텀 SVG 는 `shared/ui/` |
| `chart.js@4` + `react-chartjs-2@5` | 차트 | 챔피언/매치 통계 시각화. 가벼운 막대/도넛이면 그냥 div 로 충분 |
| `react-error-boundary@6` | 에러 바운더리 | widget/feature 단위 격리. 페이지 전체 fallback 은 Next.js `error.tsx` 로 |
| `dayjs@1` | 날짜/시간 | timezone 무거운 케이스 외엔 dayjs. moment 신규 추가 X |

## 개발 / 품질

| 라이브러리 | 용도 |
| --- | --- |
| `eslint@9` + `eslint-config-next@16` | 린트 — `pnpm lint` (next lint 아님) |
| `husky@9` + `lint-staged@16` | pre-commit 에서 변경 파일만 `eslint --fix` |
| `@playwright/test@1` | E2E — `npx playwright test` |
| `@tanstack/react-query-devtools` | dev 모드 React Query devtools (자동 마운트) |

## 같이 보기

- [개발 가이드](./development-guide.md) — 명령어 / 환경 변수
- [스타일링 가이드](./styling-guide.md) — Tailwind v4 토큰
