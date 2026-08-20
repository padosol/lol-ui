import { cache } from "react";
import { serverApiClient } from "@/shared/api/server-client";
import {
  getCategoryTree,
  getPosts,
  getPostDetail,
  DEFAULT_POST_SORT,
  type CategoryId,
  type PostSort,
} from "@/entities/community";
import { logger } from "@/shared/lib/logger";

/**
 * 목록 첫 페이지의 정렬.
 *
 * 예전에는 정렬을 URL 에 담지 않고 화면 상태로만 들고 있었다. 그러면 글을 열었다
 * 돌아올 때마다 기본 정렬로 되돌아가서, URL(`?sort=`)이 출처가 되도록 바꿨다.
 * 색인이 갈릴 걱정은 메타데이터의 canonical 이 쿼리를 뺀 경로를 가리켜 해소된다.
 */
export const DEFAULT_SORT: PostSort = DEFAULT_POST_SORT;

/**
 * generateMetadata 와 페이지 본문이 각각 호출해도 요청당 한 번만 나가도록 감싼다.
 * (React 의 요청 스코프 캐시. 요청이 끝나면 버려진다)
 */
export const loadCategoryTree = cache((locale: string) =>
  getCategoryTree(locale, serverApiClient)
);

export const loadPosts = cache(
  (categoryId: CategoryId | undefined, sort: PostSort = DEFAULT_SORT) =>
    getPosts({ categoryId, sort, period: "ALL", page: 0 }, serverApiClient)
);

export const loadPostDetail = cache((postId: number) =>
  getPostDetail(postId, serverApiClient)
);

/**
 * 목록은 게시판 트리가 없으면 사이드바가 통째로 비므로 실패를 삼키지 않고 올린다.
 * 반면 글 목록은 비어 있어도 화면이 성립해서, 실패하면 빈 목록으로 떨어뜨리고
 * 클라이언트 쿼리가 다시 시도하게 둔다.
 */
export async function loadPostsSafely(
  categoryId: CategoryId | undefined,
  sort: PostSort = DEFAULT_SORT
) {
  try {
    return await loadPosts(categoryId, sort);
  } catch (error) {
    logger.error("Failed to load community posts on server", {
      categoryId,
      sort,
      error: error instanceof Error ? error.message : String(error),
    });
    return { content: [], hasNext: false };
  }
}
