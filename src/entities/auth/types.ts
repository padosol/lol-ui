export interface MemberProfile {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
  oauthProvider: string;
}

export interface AuthState {
  user: MemberProfile | null;
  setUser: (user: MemberProfile) => void;
  clearAuth: () => void;
}
