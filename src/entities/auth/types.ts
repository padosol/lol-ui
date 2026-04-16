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

export interface AuthState {
  user: MemberProfile | null;
  setUser: (user: MemberProfile) => void;
  clearAuth: () => void;
}
