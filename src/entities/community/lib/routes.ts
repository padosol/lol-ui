import type { CategoryId, CategoryItem, CategoryTree } from "../types";

/**
 * 게시판 경로. 서버가 목록 조회에 DB id 를 받으므로 URL 도 같은 id 를 쓴다 —
 * 경로에서 바로 조회 파라미터가 나와 중간 변환이 없다.
 * "ALL" 은 게시판이 아니라 커뮤니티 첫 화면이다.
 */
export function categoryHref(categoryId: CategoryId | "ALL"): string {
  return categoryId === "ALL"
    ? "/community"
    : `/community/board/${categoryId}`;
}

/** 게시글 상세 경로. */
export function postHref(postId: number): string {
  return `/community/board/detail/${postId}`;
}

/** 게시글 수정 경로. */
export function postEditHref(postId: number): string {
  return `${postHref(postId)}/edit`;
}

/**
 * id 로 게시판을 찾는다. 숨김 게시판도 찾아준다 — 링크를 직접 받은 사용자에게
 * 404 를 주는 것보다 글 목록을 보여주는 편이 낫고, 기존 글의 배지 라벨도
 * 숨김 게시판을 해석할 수 있어야 한다.
 *
 * 못 찾으면 null. 호출부에서 notFound() 로 처리한다.
 */
export function findCategoryById(
  tree: CategoryTree,
  categoryId: CategoryId
): CategoryItem | null {
  for (const group of tree.groups) {
    for (const category of group.categories) {
      if (category.id === categoryId) return category;
    }
  }
  return null;
}

/** URL 세그먼트를 게시판 id 로. 숫자가 아니면 null 이라 호출부가 404 로 보낸다. */
export function parseCategoryId(segment: string): CategoryId | null {
  const parsed = Number(segment);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
