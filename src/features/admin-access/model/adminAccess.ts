import { isAdmin, type AuthStatus, type MemberProfile } from "@/entities/auth";
import { getApiErrorStatus } from "@/shared/api/error";

/**
 * 관리자 화면을 열어 줄지.
 * - pending: 저장소 복원 전, 또는 세션 확인 전인데 저장된 user 가 ADMIN 이 아니다(옛 저장값일 수 있다)
 * - anonymous: 로그인하지 않았다 → 로그인 화면으로 보낸다
 * - forbidden: 일반 회원 → 권한 없음 화면
 * - granted: ADMIN
 *
 * 메뉴를 숨겨도 주소로 직접 들어올 수 있으니 화면에서 한 번 막는다. 실제 권한은 서버가 토큰으로 다시 검사한다.
 */
export type AdminAccess = "pending" | "anonymous" | "forbidden" | "granted";

export interface AdminAccessInput {
  hasHydrated: boolean;
  status: AuthStatus;
  user: MemberProfile | null;
}

export function resolveAdminAccess({ hasHydrated, status, user }: AdminAccessInput): AdminAccess {
  if (!hasHydrated) return "pending";
  if (!user) return "anonymous";
  if (isAdmin(user)) return "granted";
  if (status === "unknown") return "pending";
  return "forbidden";
}

/**
 * 관리자 API 실패가 권한 문제인지. 403 과 401 을 모두 권한 없음으로 본다 —
 * lol-server 에 AccessDeniedHandler 가 없어 USER 의 관리자 호출이 401 로 바뀌어 올 수 있고,
 * ADMIN 으로 바꾼 직후에는 토큰의 역할이 아직 USER 라 거부된다(재로그인 필요).
 */
export function isAdminAccessDenied(error: unknown): boolean {
  const status = getApiErrorStatus(error);
  return status === 401 || status === 403;
}
