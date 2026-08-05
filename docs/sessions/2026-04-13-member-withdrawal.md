# Session: 회원 탈퇴 기능 구현

**날짜**: 2026-04-13  
**브랜치**: develop  

---

## 1. 사용자 요청

회원 탈퇴 기능 구현 요청. 백엔드 API 스펙 제공:

- `DELETE /api/members/me` — 인증 필요, 요청 바디 없음
- 성공: `{ "result": "SUCCESS", "errorMessage": null, "data": null }`
- 401: 인증 필요 / 토큰 만료
- 400: 이미 탈퇴한 회원
- 탈퇴 후 30일 이내 재가입 시도 시 403 에러

### 구현 요구사항
1. 마이페이지에 '회원 탈퇴' 버튼 추가
2. 탈퇴 전 확인 모달 표시
3. 탈퇴 성공 시 토큰 삭제 + 로그인 페이지 이동
4. 로그인 시 403 에러 핸들링 (30일 재가입 제한 안내)

---

## 2. 설계 논의

### UI 방식 선택
- **모달 방식** (채택) — 오버레이 모달로 탈퇴 확인 표시. 파괴적 작업에 적합.
- 인라인 확인 방식 — RiotLinkCard처럼 버튼 자리에 확인/취소 표시. 가볍지만 탈퇴에는 부적합.

사용자 선택: **모달 방식**

---

## 3. 컨텍스트 탐색 결과

### 참고한 기존 패턴
- **모달**: `src/features/duo-register/ui/DuoRegisterModal.tsx` — overlay, ESC, 바깥클릭, body overflow
- **Mutation 훅**: `src/features/nickname-edit/model/useNicknameEdit.ts` — useMutation + error state
- **로그아웃**: `src/features/auth/model/useLogout.ts` — clearAuth + router.push
- **Suspense 래핑**: `src/widgets/mypage-panel/ui/MypagePanel.tsx` — useSearchParams 감싸기
- **인라인 에러**: `{error && <p className="text-sm text-error">...</p>}`

### 주요 발견
- 토스트/알림 시스템 없음 — 에러는 인라인 표시
- API 클라이언트가 401 자동 처리 (토큰 갱신 + 리다이렉트)
- OAuth 콜백에서 hash 기반 에러는 이미 처리됨 (`useGoogleLogin.ts` L25-29)
- 로그인 페이지가 `?error=` 쿼리 파라미터를 아직 표시하지 않음

---

## 4. 구현 계획

계획 파일: `plans/polished-crunching-octopus.md`

### 구현 순서
| 순서 | 파일 | 액션 |
|------|------|------|
| 1 | `src/entities/auth/api/authApi.ts` | 수정 — `withdrawMember` 추가 |
| 2 | `src/entities/auth/index.ts` | 수정 — export 추가 |
| 3 | `src/features/member-withdrawal/model/useMemberWithdrawal.ts` | 생성 |
| 4 | `src/features/member-withdrawal/ui/WithdrawalConfirmModal.tsx` | 생성 |
| 5 | `src/features/member-withdrawal/index.ts` | 생성 |
| 6 | `src/widgets/mypage-panel/ui/AccountSection.tsx` | 수정 — 탈퇴 버튼 + 모달 |
| 7 | `src/features/auth/model/useGoogleLogin.ts` | 수정 — 403 처리 |
| 8 | `src/views/login/ui/LoginPageClient.tsx` | 수정 — 에러 배너 + Suspense |

---

## 5. 구현 완료

### 수정된 파일 (5개)
- `src/entities/auth/api/authApi.ts` — `withdrawMember()` API 함수 추가
- `src/entities/auth/index.ts` — barrel export에 `withdrawMember` 추가
- `src/widgets/mypage-panel/ui/AccountSection.tsx` — 탈퇴 버튼 + 확인 모달 연결
- `src/features/auth/model/useGoogleLogin.ts` — `getMyProfile()` 403 에러 → 로그인 페이지 에러 표시
- `src/views/login/ui/LoginPageClient.tsx` — `?error=` 쿼리 파라미터 읽어 에러 배너 표시 + Suspense 래핑

### 생성된 파일 (3개)
- `src/features/member-withdrawal/model/useMemberWithdrawal.ts` — 탈퇴 mutation 훅
- `src/features/member-withdrawal/ui/WithdrawalConfirmModal.tsx` — 확인 모달 (경고 + 취소/탈퇴 버튼)
- `src/features/member-withdrawal/index.ts` — barrel export

### 동작 흐름
1. 마이페이지 → "회원 탈퇴" 클릭 → 경고 모달 표시
2. "탈퇴하기" 클릭 → `DELETE /api/members/me` 호출 → 성공 시 인증 초기화 + 로그인 페이지 이동
3. 탈퇴 후 30일 내 재로그인 시 → 서버 403 → 로그인 페이지에 에러 배너 표시

---

## 6. 검증 결과

- `pnpm build` — 성공 (에러 없음)
- `pnpm lint` — 경고 2개 (기존 DuoRegisterModal의 react-hook-form 관련, 이번 변경과 무관)
