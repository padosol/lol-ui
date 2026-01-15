# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

League of Legends 전적 검색 서비스 (MMRTR). Next.js 16 App Router 기반 웹 애플리케이션.

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
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (stores/)
- **Data Fetching**: TanStack Query (React Query)
- **Form**: React Hook Form + Zod
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Testing**: Playwright (E2E)

## Architecture

### Data Flow Pattern

```
Component → useSummoner hook (React Query) → API functions (lib/api/) → Backend API
                    ↓
              Zustand store (global state like game data)
```

### Key Architectural Decisions

1. **API Layer** (`src/lib/api/`)

   - `client.ts`: axios 인스턴스 (기본 URL: `NEXT_PUBLIC_API_URL`)
   - 각 도메인별 API 함수 파일 (summoner.ts, match.ts, league.ts, champion.ts)
   - 모든 API 응답은 `ApiResponse<T>` 래퍼 타입 사용

2. **React Query Hooks** (`src/hooks/`)

   - API 함수를 감싸는 React Query 훅 제공
   - 캐싱 전략: 프로필 5분, 매치 목록 2분, 매치 상세 10분

3. **Global State** (`src/stores/`)

   - `useGameDataStore`: 챔피언/소환사 스펠 데이터 (public/data/\*.json에서 로드)
   - `useAuthStore`: 인증 상태 (persist middleware 사용)

4. **Layout Structure**
   - `QueryProvider`: React Query 클라이언트 제공
   - `GameDataLoader`: 앱 시작 시 게임 데이터 미리 로드

### Path Alias

`@/*` → `./src/*` (tsconfig.json에 설정됨)

## API Integration

환경 변수: `NEXT_PUBLIC_API_URL` (기본값: `http://localhost:8100/api`)

이미지 호스트: `static.mmrtr.shop` (next.config.ts에 설정됨)

## Type Definitions

모든 API 타입은 `src/types/api.ts`에 정의:

- `ApiResponse<T>`: API 응답 래퍼
- `SummonerProfile`, `MatchDetail`, `ChampionStat`, `LeagueData` 등
