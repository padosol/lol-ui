# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

League of Legends 전적 검색 서비스 (METAPICK). Next.js 16 App Router 기반 웹 애플리케이션.

## Commands

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 실행
pnpm start

# 린트
pnpm lint

# E2E 테스트 (Playwright)
npx playwright test

# 단일 테스트 파일 실행
npx playwright test tests/error-check.spec.ts
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + CSS custom properties 테마 (`globals.css`)
  - Material Design 다크 테마 기반, elevation 표면색 시스템
  - LOL 특화 시맨틱 색상: `--md-win`, `--md-loss`, `--md-team-blue`, `--md-team-red` 등
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form**: React Hook Form + Zod
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Testing**: Playwright (E2E)

## Architecture

**Feature-Sliced Design (FSD)** 아키텍처 적용. 레이어 간 의존성: 하위 → 상위만 허용.

```
app → views → widgets → features → entities → shared
```

### Data Flow Pattern

```
Component → React Query hook (entities/*/model/) → API functions (entities/*/api/) → Backend API
                    ↓
              Zustand store (shared/model/, entities/*/model/, features/*/model/)
```

### Key Architectural Decisions

1. **FSD 레이어 구조**

   - `app/`: Next.js App Router (라우팅, 레이아웃, 글로벌 설정)
   - `views/`: FSD 페이지 컴포넌트 (`*PageClient.tsx`). Next.js `pages/` 예약 디렉토리 충돌 방지를 위해 `views/` 사용. patch-notes는 순수 SSR로 `app/`에 유지 (예외)
   - `widgets/`: 복합 UI 블록 (match-history, summoner-profile, ranking 등)
   - `features/`: 사용자 기능 단위 (summoner-search, match-filter, theme-toggle 등)
   - `entities/`: 도메인 엔티티 (summoner, match, champion, league, ranking 등)
   - `shared/`: 공유 인프라 (api, lib, constants, providers, ui, model, config)

2. **API Layer** (`src/shared/api/`)

   - `client.ts`: axios 인스턴스 (기본 URL: `NEXT_PUBLIC_API_URL`)
   - `server-client.ts`: 서버 전용 axios 인스턴스 (`API_URL_INTERNAL`)
   - `types.ts`: 공통 API 타입 (`ApiResponse<T>` 등)
   - 도메인별 API 함수: `src/entities/*/api/` (summoner, match, league, champion 등)

3. **React Query Hooks** (`src/entities/*/model/`)

   - 각 엔티티별 model 디렉토리에 React Query 훅 배치
   - 예: `entities/summoner/model/useSummonerProfile.ts`, `entities/match/model/useSummonerMatches.ts`
   - 캐싱 전략: 프로필 5분, 매치 목록 2분, 매치 상세 10분

4. **Global State** (Zustand stores, FSD 레이어에 분산)

   - `src/shared/model/game-data/useGameDataStore.ts`: 챔피언/스펠 데이터
   - `src/entities/auth/model/useAuthStore.ts`: 인증 상태 (persist)
   - `src/features/region-select/model/useRegionStore.ts`: 리전 선택
   - `src/entities/season/model/useSeasonStore.ts`: 시즌 선택
   - `src/features/theme-toggle/model/useThemeStore.ts`: 테마 설정

5. **Layout Structure**
   - `QueryProvider`: React Query 클라이언트 제공 (`src/shared/providers/QueryProvider.tsx`)
   - `ThemeProvider`: 테마 관리 (`src/shared/providers/ThemeProvider.tsx`)
   - `GameDataLoader`: 앱 시작 시 게임 데이터 미리 로드 (`src/app/GameDataLoader.tsx`)

6. **SSR Pattern**
   - 서버 페이지: `src/app/` 내 `async function Page()` + `generateMetadata()`
   - 클라이언트 위임: 서버 페이지 → `src/views/*/ui/*PageClient.tsx` ("use client") 패턴
   - SSR 페이지: patch-notes, leaderboards / CSR 페이지: champion-stats, summoners

### Path Alias

`@/*` → `./src/*` (tsconfig.json에 설정됨)

## API Integration

환경 변수: `NEXT_PUBLIC_API_URL` (기본값: `http://localhost:8100/api`)

이미지 호스트: `static.mmrtr.shop` (next.config.ts에 설정됨)

**Dual API Client**:
- `src/shared/api/client.ts`: 브라우저용 (`NEXT_PUBLIC_API_URL`)
- `src/shared/api/server-client.ts`: 서버용 (`API_URL_INTERNAL` → Docker 내부 네트워크)

## Routes

- `/` - 홈 (소환사 검색)
- `/summoners/[region]/[summonerName]` - 소환사 프로필
- `/champion-stats` - 챔피언 통계 (CSR)
- `/leaderboards` - 랭킹 (SSR → Client)
- `/patch-notes` - 패치노트 목록 (SSR)
- `/patch-notes/[versionId]` - 패치노트 상세 (SSR)

## Directory Structure

```
src/
├── app/                        # Next.js App Router (라우팅, 레이아웃)
├── views/                      # FSD 페이지 컴포넌트 (*PageClient.tsx) — Next.js pages/ 충돌 방지
│   ├── home/                  # HomePage (Server Component)
│   ├── summoner/              # SummonerPageClient
│   ├── champion-stats/        # ChampionStatsPageClient
│   └── leaderboards/          # LeaderboardsPageClient
├── widgets/                    # 복합 UI 블록
│   ├── layout/                 # 공통 레이아웃 (Header, Footer)
│   ├── match-history/          # 매치 히스토리 목록
│   ├── match-detail/           # 매치 상세 정보
│   ├── summoner-profile/       # 소환사 프로필 카드
│   ├── champion-stats-panel/   # 챔피언 통계 패널
│   ├── ranking/                # 랭킹 테이블
│   ├── ingame/                 # 인게임 정보
│   ├── home-sections/          # 홈 페이지 섹션
│   └── patch-content/          # 패치노트 콘텐츠
├── features/                   # 사용자 기능 단위
│   ├── summoner-search/        # 소환사 검색
│   ├── summoner-refresh/       # 소환사 전적 갱신
│   ├── match-filter/           # 매치 필터 (큐 타입)
│   ├── champion-stats-filter/  # 챔피언 통계 필터
│   ├── ranking-filter/         # 랭킹 필터
│   ├── region-select/          # 리전 선택
│   └── theme-toggle/           # 테마 전환
├── entities/                   # 도메인 엔티티 (api/, model/, lib/, ui/)
│   ├── summoner/
│   ├── match/
│   ├── champion/
│   ├── league/
│   ├── ranking/
│   ├── season/
│   ├── spectator/
│   ├── patch-note/
│   └── auth/
└── shared/                     # 공유 인프라
    ├── api/                    # API 클라이언트 (client.ts, server-client.ts, types.ts)
    ├── lib/                    # 유틸리티 (game, tier, position, logger 등)
    ├── constants/              # 상수 (runes 등)
    ├── model/game-data/        # 게임 데이터 store/loader
    ├── providers/              # QueryProvider, ThemeProvider
    ├── config/                 # 설정 (이미지 경로 등)
    ├── ui/                     # 공통 UI 컴포넌트 (tooltip 등)
    └── mocks/                  # 테스트 모킹 데이터
```

- `docs/patch/` - 크롤링된 패치노트 HTML/JSON 캐시

## Type Definitions

- 공통 API 타입: `src/shared/api/types.ts` (`ApiResponse<T>`, `SummonerProfile`, `MatchDetail`, `ChampionStat`, `LeagueData` 등)
- 게임 데이터 타입: `src/shared/model/game-data/types.ts`
- 엔티티별 타입은 각 엔티티의 api/ 또는 model/ 디렉토리에 배치

## Deployment

- `output: "standalone"` (Docker 컨테이너 배포)
- Turbopack 사용 (개발 모드)
- `API_URL_INTERNAL`: 서버 전용 환경변수 (Docker 내부 네트워크 URL)
