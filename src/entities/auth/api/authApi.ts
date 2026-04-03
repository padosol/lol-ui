import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { AuthTokens, MemberProfile, RsoProfile } from "../types";

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

export async function getRiotAccounts(): Promise<RsoProfile[]> {
  const res = await apiClient.get<ApiResponse<RsoProfile[]>>(
    "/members/me/riot-accounts"
  );
  return res.data.data;
}

export async function linkRiotAccount(params: {
  code: string;
  redirectUri: string;
  platformId: string;
}): Promise<RsoProfile> {
  const res = await apiClient.post<ApiResponse<RsoProfile>>(
    "/members/me/riot-accounts",
    params
  );
  return res.data.data;
}

export async function disconnectRiotAccount(linkId: number): Promise<void> {
  await apiClient.delete(`/members/me/riot-accounts/${linkId}`);
}
