import type { ApiResponse } from "@/shared/api/types";
import type { PatchNoteDetailResponse, PatchVersionListItem } from "../types";
import { apiClient } from "@/shared/api/client";

export async function getPatchVersions(): Promise<PatchVersionListItem[]> {
  const response = await apiClient.get<ApiResponse<PatchVersionListItem[]>>(
    "/v1/patch-notes"
  );
  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "패치 버전 목록 조회 실패");
  }
  return response.data.data;
}

export async function getPatchNote(
  versionId: string
): Promise<PatchNoteDetailResponse> {
  const response = await apiClient.get<ApiResponse<PatchNoteDetailResponse>>(
    `/v1/patch-notes/${versionId}`
  );
  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "패치노트 조회 실패");
  }
  return response.data.data;
}
