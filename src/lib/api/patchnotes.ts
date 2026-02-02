import type { ApiResponse } from "@/types/api";
import type {
  PatchNote,
  PatchVersion,
  PatchVersionsResponse,
} from "@/types/patchnotes";
import { apiClient } from "./client";

/**
 * 패치 버전 목록 조회
 * @param page 페이지 번호 (0부터 시작)
 * @returns 패치 버전 목록
 */
export async function getPatchVersions(
  page: number = 0
): Promise<PatchVersion[]> {
  const response = await apiClient.get<ApiResponse<PatchVersionsResponse>>(
    "/patch-notes/versions",
    {
      params: { page },
    }
  );

  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "패치 버전 목록 조회 실패");
  }

  return response.data.data.content;
}

/**
 * 특정 패치노트 상세 조회
 * @param version 패치 버전 (예: "25.2")
 * @returns 패치노트 상세 정보
 */
export async function getPatchNote(version: string): Promise<PatchNote> {
  const response = await apiClient.get<ApiResponse<PatchNote>>(
    `/patch-notes/${version}`
  );

  if (response.data.result === "FAIL") {
    throw new Error(response.data.errorMessage || "패치노트 조회 실패");
  }

  return response.data.data;
}
