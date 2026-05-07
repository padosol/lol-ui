# CLAUDE.md - METAPICK (LoL 전적 검색)

## Commands

```bash
pnpm dev              # 개발 서버
pnpm build            # 빌드
pnpm lint             # eslint 직접 실행 (next lint 아님)
npx playwright test   # E2E 테스트
```

## Architecture (Feature-Sliced Design)

의존성 방향: 하위 → 상위만 허용.

```
app → views → widgets → features → entities → shared
```

```
src/
├── app/          # Next.js App Router (라우팅, 레이아웃, SSR 페이지)
├── views/        # FSD 페이지 컴포넌트 (*PageClient.tsx) — pages/ 예약어 충돌 방지
├── widgets/      # 복합 UI 블록 (match-history, summoner-profile 등)
├── features/     # 사용자 기능 단위 (summoner-search, match-filter 등)
├── entities/     # 도메인 엔티티 — 각각 api/, model/, lib/, ui/ 하위 구조
└── shared/       # 공유 인프라 (api/, lib/, constants/, providers/, model/, ui/, config/)
```

`docs/patch/` — 크롤링된 패치노트 HTML/JSON 캐시

### Data Flow

```
Component → React Query hook (entities/*/model/) → API함수 (entities/*/api/) → Backend
                    ↓
              Zustand store (shared/model/, entities/*/model/, features/*/model/)
```

### Non-obvious Decisions

- **views/ 사용 이유**: Next.js `pages/` 예약 디렉토리 충돌 방지. 단, patch-notes는 순수 SSR이므로 `app/`에 유지 (예외).
- **Dual API Client**: 브라우저용 `shared/api/client.ts` (`NEXT_PUBLIC_API_URL`) + 서버용 `shared/api/server-client.ts` (`API_URL_INTERNAL`, Docker 내부 네트워크).
- **SSR/CSR 구분**: SSR = patch-notes, leaderboards / CSR = champion-stats, summoners. 서버 페이지 → `views/*/ui/*PageClient.tsx` ("use client") 위임 패턴.
- **React Query 캐싱**: 프로필 5분, 매치 목록 2분, 매치 상세 10분.
- **GameDataLoader** (`app/GameDataLoader.tsx`): 앱 시작 시 챔피언/스펠 데이터를 Zustand store에 미리 로드.
- **CSS 테마**: Material Design 다크 테마 기반 + LOL 시맨틱 색상 (`--md-win`, `--md-loss`, `--md-team-blue`, `--md-team-red` 등, `globals.css` 참고).

### Environment Variables (`.env.example`)

- `NEXT_PUBLIC_API_URL` — 외부 API (기본: `http://localhost:8100/api`)
- `API_URL_INTERNAL` — 서버 전용 내부 API (Docker 네트워크)
- `NEXT_PUBLIC_IMAGE_HOST` — 정적 이미지 호스트 (`https://static.mmrtr.shop`)

## Git Workflow

브랜치 네이밍: `<type>/MP-<번호>-<kebab-설명>` → `develop` → `main`. 핫픽스만 예외로 `hotfix/MP-<번호>-*` → `main` → `develop` 역머지.

| prefix | 설명 |
| --- | --- |
| `feature` | 신규 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 구조 개선 |
| `chore` | 코드 영향 없는 산출물·문서·CI·도구 변경 (의존 업그레이드, audit 산출물, lint 룰 추가 등) |
| `docs` | 사용자/개발자 문서 |
| `hotfix` | 긴급 prod 패치 (main 직접 분기) |
