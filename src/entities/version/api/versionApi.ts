import type { AxiosInstance } from "axios";
import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { Version } from "../types";

export async function getLatestVersion(
  client: AxiosInstance = apiClient
): Promise<Version> {
  const response = await client.get<ApiResponse<Version>>("/v1/versions/latest");
  return response.data.data;
}

export async function getVersions(
  client: AxiosInstance = apiClient
): Promise<Version[]> {
  const response = await client.get<ApiResponse<Version[]>>("/v1/versions");
  return response.data.data;
}
