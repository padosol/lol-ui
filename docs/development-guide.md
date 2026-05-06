# 개발 가이드

## 사전 준비

- Node.js 20+ (Next.js 16 / React 19 호환).
- 패키지 매니저: **pnpm** (`packageManager: "pnpm@10.12.1"` 고정. lock 파일은 `pnpm-lock.yaml` 만 존재).

```bash
corepack enable          # 권장 — packageManager 필드 자동 사용
pnpm install
```

## 환경 변수

루트의 `.env.example` 을 `.env.local` 로 복사 후 채운다.

| 키 | 용도 | 기본값 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 브라우저용 외부 API base URL | `http://localhost:8100/api` |
| `API_URL_INTERNAL` | 서버 컴포넌트 전용 (Docker 내부 네트워크 등). 미설정 시 `NEXT_PUBLIC_API_URL` 로 fallback | `http://localhost:8100/api` |
| `NEXT_PUBLIC_IMAGE_HOST` | 정적 이미지 호스트 | `https://static.mmrtr.shop` |

> `NEXT_PUBLIC_*` 는 클라이언트 번들에 inline 됨 — 비밀값 절대 X.
> `next.config.ts` 의 `images.remotePatterns` 에 새 호스트 추가 시 함께 업데이트.

## 명령어

```bash
pnpm dev          # 개발 서버 (http://localhost:3000, hot reload)
pnpm build        # 프로덕션 빌드 (output: standalone)
pnpm start        # 빌드 결과 실행
pnpm lint         # eslint 직접 실행 (next lint 가 아님 — eslint.config.mjs 사용)
npx playwright test   # E2E 테스트
```

> 타입 체크는 `pnpm build` 가 빌드 시점에 수행. 별도 typecheck 명령은 없으니 빌드로 검증.

## Git Hook

`husky@9` 가 `prepare` 스크립트로 자동 설치. `.husky/pre-commit` 이 `npx lint-staged` 실행 → 변경된 `*.{js,jsx,ts,tsx}` 만 `eslint --fix`.

훅 우회 (`--no-verify`) 금지 — 실패하면 원인 수정 후 재시도.

## API 클라이언트 선택

| 컨텍스트 | 사용 모듈 | base URL |
| --- | --- | --- |
| 브라우저 / `"use client"` | `@/shared/api/client` | `NEXT_PUBLIC_API_URL` |
| 서버 컴포넌트 / 서버 액션 | `@/shared/api/server-client` | `API_URL_INTERNAL` (없으면 `NEXT_PUBLIC_API_URL`) |

브라우저 클라이언트는 401 자동 토큰 갱신 + 로그인 페이지 redirect 인터셉터 포함 (`/auth/refresh`, `/auth/logout` 은 재시도 제외).

## 같이 보기

- [프로젝트 구조](./project-structure.md) — 코드 어디에 둘지
- [라이브러리](./libraries.md) — 무엇을 쓰고 무엇을 피할지
