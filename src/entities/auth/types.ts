export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MemberProfile {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
  oauthProvider: string;
}

export interface RsoProfile {
  id: number;
  puuid: string;
  gameName: string;
  tagLine: string;
  platformId: string;
  linkedAt: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: MemberProfile | null;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: MemberProfile) => void;
  clearAuth: () => void;
}
