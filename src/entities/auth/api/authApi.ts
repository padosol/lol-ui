import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { MemberProfile } from "../types";

export async function logout(): Promise<void> {
  await apiClient.post("/v1/auth/logout");
}

export async function getMyProfile(): Promise<MemberProfile> {
  const res = await apiClient.get<ApiResponse<MemberProfile>>("/v1/members/me");
  return res.data.data;
}

export async function updateNickname(nickname: string): Promise<MemberProfile> {
  const res = await apiClient.patch<ApiResponse<MemberProfile>>("/v1/members/me", {
    nickname,
  });
  return res.data.data;
}

export async function disconnectSocialAccount(socialAccountId: number): Promise<void> {
  await apiClient.delete(`/v1/members/me/social-accounts/${socialAccountId}`);
}

export async function withdrawMember(): Promise<void> {
  await apiClient.delete("/v1/members/me");
}
