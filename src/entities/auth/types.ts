export interface SocialAccount {
  id: number;
  provider: string;
  providerId: string;
  email: string;
  nickname: string;
  linkedAt: string;
}

export interface MemberProfile {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  profileImageUrl: string;
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
