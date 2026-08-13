import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { CategoryTree } from "../types";

/**
 * 게시판 목록을 그룹핑·정렬이 끝난 트리로 받는다.
 * 라벨도 서버가 로케일에 맞춰 해석해 내려주므로 messages 를 거치지 않는다.
 */
export async function getCategoryTree(locale: string): Promise<CategoryTree> {
  const response = await apiClient.get<ApiResponse<CategoryTree>>(
    "/community/categories",
    { params: { locale } }
  );
  return response.data.data;
}
