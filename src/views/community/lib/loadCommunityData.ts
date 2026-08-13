import { cache } from "react";
import { serverApiClient } from "@/shared/api/server-client";
import {
  getCategoryTree,
  getPosts,
  getPostDetail,
  type CategoryId,
  type PostSort,
} from "@/entities/community";
import { logger } from "@/shared/lib/logger";

/**
 * 목록 첫 페이지의 정렬. 화면에서 정렬을 바꾸는 것은 클라이언트 쿼리가 이어받으므로
 * URL 에는 담지 않는다. 정렬 변형까지 색인시킬 이유가 없고 canonical 도 갈리지 않는다.
 */
export const DEFAULT_SORT: PostSort = "HOT";

/**
 * generateMetadata 와 페이지 본문이 각각 호출해도 요청당 한 번만 나가도록 감싼다.
 * (React 의 요청 스코프 캐시. 요청이 끝나면 버려진다)
 */
export const loadCategoryTree = cache((locale: string) =>
  getCategoryTree(locale, serverApiClient)
);

export const loadPosts = cache((categoryId: CategoryId | undefined) =>
  getPosts(
    { categoryId, sort: DEFAULT_SORT, period: "ALL", page: 0 },
    serverApiClient
  )
);

export const loadPostDetail = cache((postId: number) =>
  getPostDetail(postId, serverApiClient)
);

/**
 * 목록은 게시판 트리가 없으면 사이드바가 통째로 비므로 실패를 삼키지 않고 올린다.
 * 반면 글 목록은 비어 있어도 화면이 성립해서, 실패하면 빈 목록으로 떨어뜨리고
 * 클라이언트 쿼리가 다시 시도하게 둔다.
 */
export async function loadPostsSafely(categoryId: CategoryId | undefined) {
  try {
    return await loadPosts(categoryId);
  } catch (error) {
    logger.error("Failed to load community posts on server", {
      categoryId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { content: [], hasNext: false };
  }
}
