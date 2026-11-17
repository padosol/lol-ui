import axios from "axios";
import type { AuthStatus, MemberProfile } from "@/entities/auth";

export interface SessionBootstrapDeps {
  hasStoredUser: boolean;
  fetchProfile: () => Promise<MemberProfile>;
  setUser: (user: MemberProfile) => void;
  clearAuth: () => void;
  setStatus: (status: AuthStatus) => void;
}

function isUnauthorized(e: unknown): boolean {
  return axios.isAxiosError(e) && e.response?.status === 401;
}

/**
 * 앱 진입 시 저장된 로그인 상태가 서버 세션과 맞는지 한 번 확인한다.
 *
 * <p>401 은 인터셉터의 refresh 까지 실패했다는 뜻이다. 한 번 더 확인해 두 번 연속 401 일 때만
 * 조용히 로그아웃한다. 네트워크·5xx 는 세션이 끝났다는 증거가 아니므로 user 를 유지하고
 * unverified 로 둔다.
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
    if (!isUnauthorized(e)) {
      deps.setStatus("unverified");
      return "unverified";
    }
  }

  try {
    deps.setUser(await deps.fetchProfile());
    return "authenticated";
  } catch (e) {
    if (isUnauthorized(e)) {
      deps.clearAuth();
      return "anonymous";
    }
    deps.setStatus("unverified");
    return "unverified";
  }
}
