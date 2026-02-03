import type { ApiResponse } from "@/types/api";
import type {
  PatchNoteDetailResponse,
  PatchVersionListItem,
} from "@/types/patchnotes";
import { apiClient } from "./client";

/**
 * 패치 버전 목록 조회
 * @returns 패치 버전 목록
 */
export async function getPatchVersions(): Promise<PatchVersionListItem[]> {
  const response = await apiClient.get<ApiResponse<PatchVersionListItem[]>>(
    "/v1/patch-notes"
  );

  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "패치 버전 목록 조회 실패");
  }

  return response.data.data;
}

/**
 * 특정 패치노트 상세 조회
 * @param versionId 패치 버전 ID (예: "26.S1.1")
 * @returns 패치노트 상세 정보
 */
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
