# 프로젝트 구조

Next.js 16 App Router + Feature-Sliced Design (FSD).
의존성 방향은 단방향 — 상위 레이어만 하위 레이어를 import한다.

```
app → views → widgets → features → entities → shared
```

## 레이어

| 레이어 | 역할 | 예시 |
| --- | --- | --- |
| `src/app/` | Next.js 라우팅 / 레이아웃 / 메타데이터 / SSR 진입점 | `app/champion-stats/page.tsx` |
| `src/views/` | 페이지 단위 클라이언트 컴포넌트 (`*PageClient.tsx`) | `views/champion-stats/ui/...` |
| `src/widgets/` | 여러 features를 조립하는 복합 UI 블록 | `widgets/match-history`, `widgets/summoner-profile` |
| `src/features/` | 사용자 인터랙션 단위 기능 (검색, 필터, 토글…) | `features/summoner-search`, `features/match-filter` |
| `src/entities/` | 도메인 엔티티 — `api/`, `model/`, `lib/`, `ui/`, `types.ts` | `entities/summoner`, `entities/match`, `entities/champion` |
| `src/shared/` | 재사용 인프라 (api, lib, ui, providers, model, constants, config) | `shared/api/client.ts`, `shared/providers/QueryProvider.tsx` |

> `views/` 가 따로 있는 이유: Next.js 의 `pages/` 가 예약어라 충돌을 피하기 위함.
> 패치노트 페이지는 순수 SSR 이라 `views/` 를 거치지 않고 `app/patch-notes/` 에 머문다 (예외).

## SSR vs CSR

- **SSR** — `app/patch-notes/`, `app/leaderboards/` : 서버에서 데이터 fetching 후 HTML 으로 렌더.
- **CSR** — `app/champion-stats/`, `app/summoners/` : `app/<route>/page.tsx` 가 `views/<route>/ui/*PageClient.tsx` ("use client") 로 위임.

## 데이터 흐름

```
Component → React Query hook (entities/*/model/) → API 함수 (entities/*/api/) → backend
                              ↓
            Zustand store (shared/model/, entities/*/model/, features/*/model/)
```

## 같이 보기

- [컴포넌트 작성 가이드](./component-guide.md) — 새 컴포넌트를 어디 둘지 결정 트리
- [라이브러리](./libraries.md) — 각 레이어에서 쓰는 의존성
- [개발 가이드](./development-guide.md) — 실행/빌드/lint
