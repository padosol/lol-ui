# CLAUDE.md 업데이트 계획

## Context
현재 CLAUDE.md는 아키텍처와 데이터 플로우를 잘 다루고 있지만, 실제 코딩 시 필요한 기술 스택 세부사항(의존성, path alias, ESLint)과 코딩 패턴(CSS, 컴포넌트 규칙, Entity 구조)이 누락되어 있음.

## 변경 사항

### `CLAUDE.md` — Commands 섹션 아래에 두 섹션 추가

**1. Tech Stack 섹션**
```
- Next.js 16 (App Router, standalone output) / React 19 / TypeScript (strict)
- Tailwind CSS v4 + Material Design 2 CSS variables (`globals.css`)
- Zustand v5 (전역 상태) / React Query v5 (서버 상태)
- Axios (HTTP) / react-hook-form + Zod (폼) / lucide-react (아이콘) / dayjs (날짜)
- Path alias: `@/*` → `src/*` (단일 별칭)
- ESLint v9 flat config — `_` 접두사 미사용 변수 허용
```

**2. Code Conventions 섹션**
```
- CSS: Tailwind 유틸리티 + 시맨틱 CSS 변수 클래스 (text-on-surface, bg-surface-8, text-win, text-loss, border-divider)
- 컴포넌트: 클라이언트 컴포넌트는 "use client" 필수, interface 기반 props, default export
- 유틸리티: 컴포넌트 파일에 get* 유틸 함수 co-locate 후 named export
- Entity 내부 구조: api/ → model/ (useQuery 훅) → lib/ (유틸) → types.ts → index.ts (벌크 re-export)
- React Query 훅: queryKey 배열 구성 ["도메인", ...params], enabled 조건 필수
```

## 수정 파일
- `CLAUDE.md` (1개 파일만 수정)

## 검증
- `pnpm lint` 실행하여 린트 통과 확인 (CLAUDE.md는 마크다운이므로 영향 없음)
- 변경 후 CLAUDE.md 200줄 이내인지 확인
