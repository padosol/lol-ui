import type { ApiResponse } from "@/shared/api/types";
import type { PatchNoteDetailResponse, PatchVersionListItem } from "../types";
import { apiClient } from "@/shared/api/client";

export async function getPatchVersions(): Promise<PatchVersionListItem[]> {
  const response = await apiClient.get<ApiResponse<PatchVersionListItem[]>>(
    "/v1/patch-notes"
  );
  if (response.data.result === "FAIL") {
    throw new Error(
      response.data.errorMessage || "Failed to fetch patch version list"
    );
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
    throw new Error(response.data.errorMessage || "Failed to fetch patch note");
  }
  return response.data.data;
}
