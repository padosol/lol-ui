# 로그인 기능 구현 플랜

## Context

METAPICK 프로젝트에 로그인 기능을 추가한다. 백엔드 API(`docs/index.html`)에는 Google OAuth 로그인만 존재하므로, 이메일/패스워드 폼은 UI만 구현(비활성화 + "준비중" 표시)하고 Google OAuth를 실제 동작하도록 구현한다.

---

## 구현 순서 및 파일 목록

### 1. Entity 레이어 — 타입 & 스토어 & API 확장

**`src/entities/auth/types.ts`** (수정)
- `AuthTokens { accessToken, refreshToken, expiresIn }` 추가
- `MemberProfile { id, email, nickname, profileImageUrl, oauthProvider }` 추가
- `GoogleLoginRequest { code, redirectUri }` 추가
- `AuthState` 확장: `accessToken`, `refreshToken`, `expiresIn`, `user` 필드 + `setTokens`, `setUser`, `clearAuth` 액션

**`src/entities/auth/model/useAuthStore.ts`** (수정)
- `isLoggedIn` boolean만 있던 스토어를 토큰/유저 정보 포함하도록 확장
- `persist`의 `partialize`로 함수 제외한 상태만 직렬화
- 스토리지 키 `auth-storage` 유지

**`src/entities/auth/api/authApi.ts`** (신규)
- `loginWithGoogle(req)` → `POST /auth/login/google`
- `refreshToken(req)` → `POST /auth/refresh`
- `logout()` → `POST /auth/logout`
- `getMyProfile()` → `GET /members/me`
- 기존 `apiClient` (`src/shared/api/client.ts`) 사용, 응답 타입 `ApiResponse<T>` (`src/shared/api/types.ts`) 재사용

**`src/entities/auth/index.ts`** (수정)
- 새 API 함수 및 타입 export 추가

### 2. Shared 레이어 — API 인터셉터 강화

**`src/shared/api/client.ts`** (수정)
- **Request 인터셉터 추가**: `localStorage`의 `auth-storage`에서 `accessToken` 읽어 `Authorization: Bearer` 헤더 부착
  - FSD 규칙상 shared → entities 임포트 금지이므로, localStorage 직접 접근
- **Response 인터셉터 확장**: 401 응답 시 토큰 갱신 로직
  - `refreshToken`으로 `POST /auth/refresh` 호출 (순환 방지를 위해 `axios.post` 직접 사용)
  - 동시 401 요청은 큐에 대기시키고 갱신 완료 후 일괄 재시도
  - 갱신 실패 시 localStorage 클리어 + `/login`으로 리다이렉트

### 3. Feature 레이어 — 로그인 기능

**`src/features/auth/model/useGoogleLogin.ts`** (신규)
- `initiateGoogleLogin()`: Google OAuth 동의 화면으로 리다이렉트
  - URL: `https://accounts.google.com/o/oauth2/v2/auth`
  - 필요 env: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - `redirectUri`: `${window.location.origin}/callback`
- `handleGoogleCallback(code)`: 콜백 코드 → 백엔드 로그인 → 토큰 저장 → 프로필 조회 → 홈으로 이동

**`src/features/auth/model/useLogout.ts`** (신규)
- `handleLogout()`: `POST /auth/logout` 호출 → `clearAuth()` → 홈으로 이동
- API 실패해도 로컬 상태는 항상 클리어

**`src/features/auth/ui/LoginForm.tsx`** (신규)
- react-hook-form + zod 사용 (이미 설치됨: `@hookform/resolvers@5.2.2`, `zod@4.3.6`)
- 이메일/패스워드 입력 필드, submit 버튼 `disabled` + "준비중" 표시
- 프로젝트 디자인 시스템 색상 사용 (`bg-surface-4`, `border-divider`, `text-on-surface` 등)

**`src/features/auth/ui/GoogleLoginButton.tsx`** (신규)
- Google "G" 로고 SVG 인라인 + "Google로 로그인" 텍스트
- 클릭 시 `initiateGoogleLogin()` 호출

**`src/features/auth/index.ts`** (신규)
- `GoogleLoginButton`, `LoginForm`, `useGoogleLogin`, `useLogout` export

### 4. View 레이어 — 페이지 구성

**`src/views/login/ui/LoginPageClient.tsx`** (신규)
- `"use client"` — 기존 `LeaderboardsPageClient.tsx` 패턴 따름
- `Header` + `Navigation` + `main`(로그인 폼 + 구분선 + Google 버튼) + `Footer`
- 최대 너비 400px 중앙 정렬

**`src/views/login/index.ts`** (신규)

**`src/views/callback/ui/CallbackPageClient.tsx`** (신규)
- URL에서 `code` 파라미터 추출 → `handleGoogleCallback(code)` 호출
- `useRef`로 StrictMode 이중 호출 방지
- "로그인 처리 중..." 로딩 UI

**`src/views/callback/index.ts`** (신규)

### 5. App 레이어 — 라우트

**`src/app/login/page.tsx`** (신규)
- Metadata: `title: "로그인 | METAPICK.ME"`
- `<LoginPageClient />` 렌더

**`src/app/callback/page.tsx`** (신규)
- `<CallbackPageClient />` 렌더

### 6. Widget 레이어 — Header 업데이트

**`src/widgets/layout/ui/Header.tsx`** (수정)
- 주석 처리된 인증 코드 활성화 및 교체
- 로그인 상태: 닉네임 표시 + "로그아웃" 버튼
- 비로그인 상태: `/login` 링크 ("로그인")
- `useLogout` (features/auth), `useAuthStore` (entities/auth) 임포트 — FSD 규칙 준수

### 7. 환경 변수

**`.env.example`** (수정)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 추가

---

## Google OAuth 플로우

```
1. /login 페이지에서 "Google로 로그인" 클릭
   → Google OAuth 동의 화면으로 리다이렉트

2. 사용자 동의
   → /callback?code=AUTH_CODE 로 리다이렉트

3. CallbackPageClient에서 code 추출
   → POST /api/auth/login/google { code, redirectUri }
   → 응답: { accessToken, refreshToken, expiresIn }

4. 토큰 Zustand 저장 (localStorage persist)
   → GET /api/members/me 프로필 조회
   → 홈(/)으로 이동
```

---

## 주의사항

- **Zustand hydration mismatch**: 서버 렌더링은 항상 비로그인 상태. Header의 인증 UI는 클라이언트에서만 렌더링되므로 이미 "use client" 컴포넌트라 문제없음
- **토큰 갱신 동시성**: mutex 패턴으로 동시 401 요청 큐잉 처리
- **FSD 레이어 위반 방지**: shared 레이어의 인터셉터는 localStorage 직접 접근 (entities 임포트 없음)
- **콜백 이중 호출 방지**: React StrictMode에서 useEffect 이중 실행 대비 useRef 가드

---

## 검증 방법

1. `pnpm build` — 빌드 에러 없는지 확인
2. `pnpm lint` — ESLint 통과 확인
3. `pnpm dev` → 브라우저에서:
   - `/login` 접근 → 이메일/패스워드 폼(비활성화) + Google 버튼 렌더 확인
   - Header에 "로그인" 링크 표시 확인
   - Google 버튼 클릭 → OAuth 동의 화면 리다이렉트 확인 (GOOGLE_CLIENT_ID 설정 필요)
