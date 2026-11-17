export const ACCESS_TOKEN_COOKIE = "accessToken";

/** 서버 컴포넌트가 쿠키의 액세스 토큰을 백엔드로 전달할 때 쓰는 Authorization 헤더. */
export function bearerAuthHeaders(
  token: string | undefined
): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
