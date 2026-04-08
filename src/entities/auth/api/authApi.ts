import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { AuthTokens, MemberProfile } from "../types";

export async function refreshToken(token: string): Promise<AuthTokens> {
  const res = await apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh", {
    refreshToken: token,
  });
  return res.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getMyProfile(): Promise<MemberProfile> {
  const res = await apiClient.get<ApiResponse<MemberProfile>>("/members/me");
  return res.data.data;
}

export async function updateNickname(nickname: string): Promise<MemberProfile> {
  const res = await apiClient.patch<ApiResponse<MemberProfile>>("/members/me/nickname", {
    nickname,
  });
  return res.data.data;
}
