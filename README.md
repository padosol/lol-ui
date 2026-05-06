# LoL 전적 검색 서비스 (lol-ui)

League of Legends 전적 검색 서비스의 웹 프론트엔드.
**Next.js 16 (App Router) + React 19 + TypeScript** 기반 Feature-Sliced Design.

## 빠른 시작

```bash
corepack enable          # packageManager: pnpm@10.12.1 자동 사용
pnpm install
cp .env.example .env.local
pnpm dev                 # http://localhost:3000
```

자세한 환경 변수 / 빌드·lint·E2E 명령은 [`docs/development-guide.md`](./docs/development-guide.md).

## 기술 스택

| 영역 | 사용 |
| --- | --- |
| Framework | `next@16.1` (App Router), `react@19.2`, `typescript@5` |
| 데이터 | `@tanstack/react-query@5`, `axios@1`, `zustand@5` |
| 폼 / 검증 | `react-hook-form@7`, `zod@4` |
| UI | `tailwindcss@4`, `lucide-react`, `chart.js@4` + `react-chartjs-2@5` |
| 품질 | `eslint@9`, `husky@9` + `lint-staged@16`, `@playwright/test@1` |

전체 의존성과 선택 이유는 [`docs/libraries.md`](./docs/libraries.md).

## 아키텍처 — Feature-Sliced Design

의존성 방향은 단방향 — 상위 레이어만 하위를 import한다.

```
app → views → widgets → features → entities → shared
```

| 레이어 | 책임 |
| --- | --- |
| `src/app/` | Next.js 라우팅 / 레이아웃 / 메타데이터 / SSR 진입점 |
| `src/views/` | 페이지 단위 클라이언트 컴포넌트 (`*PageClient.tsx`) |
| `src/widgets/` | 여러 features를 조립하는 복합 UI 블록 |
| `src/features/` | 사용자 인터랙션 단위 기능 (검색, 필터, 토글…) |
| `src/entities/` | 도메인 엔티티 — `api/`, `model/`, `lib/`, `ui/` |
| `src/shared/` | 재사용 인프라 (api, lib, ui, providers, model, constants, config) |

> `views/` 가 따로 있는 이유: Next.js 의 `pages/` 가 예약어라 충돌 방지.
> 패치노트 페이지는 순수 SSR 이라 `views/` 를 거치지 않고 `app/patch-notes/` 에 머문다 (예외).

상세는 [`docs/project-structure.md`](./docs/project-structure.md), 새 컴포넌트 배치 결정 트리는 [`docs/component-guide.md`](./docs/component-guide.md).

## SSR vs CSR

- **SSR** — `app/patch-notes/`, `app/leaderboards/` : 서버에서 데이터 fetching 후 HTML 으로 렌더.
- **CSR** — `app/champion-stats/`, `app/summoners/` : `app/<route>/page.tsx` 가 `views/<route>/ui/*PageClient.tsx` ("use client") 로 위임.

## 도메인

- 🔍 **소환사 프로필 / 전적** — `/summoners/[region]/[summonerName]`
- 📊 **매치 히스토리 / 상세** — 소환사 페이지 안의 widget
- 🏆 **챔피언 통계 / 빌드** — `/champion-stats`, `/champion-stats/[championId]`
- 📈 **리더보드** — `/leaderboards`
- 📝 **패치노트** — `/patch-notes`, `/patch-notes/[versionId]`
- 👥 **듀오 매칭** — `/duo`
- 💬 **커뮤니티** — `/community`, `/community/[postId]`
- 👤 **인증 / 마이페이지** — `/login`, `/auth/callback`, `/mypage`

엔티티 폴더는 `src/entities/` (auth, champion, community, duo, league, match, patch-note, ranking, season, spectator, summoner) 참고.

## 데이터 흐름

```
Component → React Query hook (entities/*/model/) → API 함수 (entities/*/api/) → backend
                              ↓
            Zustand store (shared/model/, entities/*/model/, features/*/model/)
```

브라우저 / 서버 컴포넌트별 API 클라이언트 분리 (`shared/api/client.ts` vs `shared/api/server-client.ts`) — [`docs/development-guide.md`](./docs/development-guide.md#api-클라이언트-선택) 참고.

## 문서

- [프로젝트 구조](./docs/project-structure.md) — FSD 레이어 / SSR vs CSR
- [컴포넌트 작성 가이드](./docs/component-guide.md) — 어디에 둘지 결정 트리
- [라이브러리 및 의존성](./docs/libraries.md) — Next.js / React Query / Zustand / Tailwind / …
- [스타일링 가이드](./docs/styling-guide.md) — Tailwind v4 토큰 / 다크-라이트
- [개발 가이드](./docs/development-guide.md) — 환경 변수 / 명령 / pre-commit

## 라이선스

이 프로젝트는 개인 프로젝트입니다.
