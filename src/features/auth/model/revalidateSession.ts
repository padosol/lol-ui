import { getMyProfile, useAuthStore, type AuthStatus, type MemberProfile } from "@/entities/auth";
import { bootstrapSession } from "./bootstrapSession";

// 확인 중인 요청. 동시에 부른 곳(StrictMode 의 effect 재실행, 여러 화면)이 하나를 함께 기다린다.
let inFlight: Promise<AuthStatus> | null = null;

/**
 * 저장된 로그인 상태를 서버 세션과 다시 맞춘다(규칙은 bootstrapSession).
 *
 * <p>앱 진입 때 한 번(SessionBootstrap), 그리고 상세 화면에서 세션은 로그인인데 서버가
 * 비로그인으로 답했을 때 부른다 — 읽는 동안 토큰이 만료된 채 다른 글로 이동하면
 * accessToken 쿠키가 없어 SSR·상세 GET 이 비로그인으로 성공하고, 401 이 아니라 refresh 도 돌지 않는다.
 * /me 는 인증 필수라 401 → refresh 로 쿠키를 다시 받는다.
 */
export function revalidateSession(): Promise<AuthStatus> {
  if (inFlight) return inFlight;

  const { user, clearAuth, setStatus } = useAuthStore.getState();
  inFlight = bootstrapSession({
    hasStoredUser: user !== null,
    fetchProfile: () => getMyProfile({ skipAuthRedirect: true }),
    setUser: applyUnlessSignedOut,
    clearAuth,
    setStatus,
  }).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** 확인하는 동안 로그아웃했다면 응답이 늦게 와도 user 를 되살리지 않는다. */
function applyUnlessSignedOut(profile: MemberProfile): void {
  const state = useAuthStore.getState();
  if (state.user !== null) state.setUser(profile);
}
