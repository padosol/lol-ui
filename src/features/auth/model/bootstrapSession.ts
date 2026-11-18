import axios from "axios";
import type { AuthStatus, MemberProfile } from "@/entities/auth";

export interface SessionBootstrapDeps {
  hasStoredUser: boolean;
  fetchProfile: () => Promise<MemberProfile>;
  setUser: (user: MemberProfile) => void;
  clearAuth: () => void;
  setStatus: (status: AuthStatus) => void;
}

// 4xx 지만 계정 상태가 아니라 일시 오류다(요청 시간 초과, 요청 과다).
const TRANSIENT_4XX = new Set([408, 429]);

/**
 * 서버가 이 세션을 받아 주지 않았다(4xx)면 그 상태 코드, 아니면 undefined.
 * 응답이 없는 네트워크 오류·타임아웃, 408·429, 5xx 는 세션이 끝났다는 증거가 아니다.
 */
function rejectedStatus(e: unknown): number | undefined {
  if (!axios.isAxiosError(e)) return undefined;
  const status = e.response?.status;
  if (status === undefined || status < 400 || status >= 500) return undefined;
  return TRANSIENT_4XX.has(status) ? undefined : status;
}

/**
 * 저장된 로그인 상태가 서버 세션과 맞는지 확인한다.
 *
 * <p>401 은 인터셉터의 refresh 까지 실패했다는 뜻이다. 다른 탭이 먼저 토큰을 회전시켰을 수 있어
 * 한 번 더 확인하고, 그래도 거절(4xx)되면 조용히 로그아웃한다. 401 이 아닌 4xx(탈퇴 403·삭제 404 등)는
 * 다시 물어도 같은 답이라 바로 로그아웃한다. 네트워크·타임아웃·408·429·5xx 는 세션이 끝났다는 증거가
 * 아니므로 user 를 유지하고 unverified 로 둔다.
 */
export async function bootstrapSession(deps: SessionBootstrapDeps): Promise<AuthStatus> {
  if (!deps.hasStoredUser) {
    deps.setStatus("anonymous");
    return "anonymous";
  }

  try {
    deps.setUser(await deps.fetchProfile());
    return "authenticated";
  } catch (e) {
    const status = rejectedStatus(e);
    if (status === undefined) return unverified(deps);
    if (status !== 401) return signOut(deps);
  }

  try {
    deps.setUser(await deps.fetchProfile());
    return "authenticated";
  } catch (e) {
    return rejectedStatus(e) === undefined ? unverified(deps) : signOut(deps);
  }
}

function signOut(deps: SessionBootstrapDeps): AuthStatus {
  deps.clearAuth();
  return "anonymous";
}

function unverified(deps: SessionBootstrapDeps): AuthStatus {
  deps.setStatus("unverified");
  return "unverified";
}
