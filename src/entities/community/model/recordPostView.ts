import type { QueryClient } from "@tanstack/react-query";
import { logger } from "@/shared/lib/logger";
import { recordPostView } from "../api/communityApi";
import type { Post } from "../types";
import { postDetailKey } from "./usePostDetail";

/**
 * 조회를 기록하고, 응답의 조회수를 상세 캐시에 써넣는다.
 *
 * 상세 쿼리는 invalidate 하지 않는다(postDetailKey 주석 참고) — 바뀐 필드만 쓴다.
 * 조회 기록은 부수 효과라 실패해도 화면을 막지 않는다: 경고만 남기고 resolve 한다.
 */
export async function recordPostViewAndSync(
  queryClient: QueryClient,
  postId: number
): Promise<void> {
  try {
    const { viewCount } = await recordPostView(postId);
    queryClient.setQueryData<Post>(
      postDetailKey(postId),
      (prev) => prev && { ...prev, viewCount }
    );
  } catch (error) {
    logger.warn("Failed to record post view", {
      url: `/v1/community/posts/${postId}/views`,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
