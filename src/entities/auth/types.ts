export interface SocialAccount {
  id: number;
  provider: string;
  providerId: string;
  email: string;
  nickname: string;
  linkedAt: string;
}

export type MemberRole = "USER" | "ADMIN";

export interface MemberProfile {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  profileImageUrl: string;
  /**
   * 회원 역할. 로스터 API 이전 서버 응답과 auth-storage 에 저장된 옛 user 에는 없다 — 없으면 USER 로 본다.
   * JWT 에는 발급 시점 역할이 박히므로, DB 에서 ADMIN 으로 바꾼 직후엔 재로그인해야 관리자 API 가 열린다.
   */
  role?: MemberRole;
  socialAccounts: SocialAccount[];
}

/** unverified = 저장된 user 는 있으나 네트워크·5xx 로 확인하지 못한 상태 */
export type AuthStatus = "unknown" | "authenticated" | "anonymous" | "unverified";

export interface AuthState {
  user: MemberProfile | null;
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
  setUser: (user: MemberProfile) => void;
  clearAuth: () => void;
}
