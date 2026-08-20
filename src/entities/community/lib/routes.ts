import { DEFAULT_POST_SORT, POST_SORTS } from "../types";
import type {
  CategoryId,
  CategoryItem,
  CategoryTree,
  PostSort,
} from "../types";

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

/**
 * 정렬·검색어를 실은 목록 경로.
 *
 * 조회 조건이 화면 상태가 아니라 URL 에 있어야 뒤로 가기와 새로고침, 링크 공유가
 * 같은 화면을 낸다. 기본값은 붙이지 않아 "/community" 가 정식 경로로 남고,
 * 메타데이터의 canonical 은 어차피 쿼리를 뺀 경로라 색인은 갈리지 않는다.
 */
export function listHref(
  categoryId: CategoryId | "ALL",
  query: { sort?: PostSort; keyword?: string } = {}
): string {
  const params = new URLSearchParams();
  if (query.sort && query.sort !== DEFAULT_POST_SORT) {
    params.set("sort", query.sort);
  }
  if (query.keyword) params.set("q", query.keyword);

  const search = params.toString();
  const base = categoryHref(categoryId);
  return search ? `${base}?${search}` : base;
}

/**
 * 게시글 상세 경로.
 *
 * 목록에서 열었다면 그때의 정렬과 출처 게시판을 함께 넘긴다. 상세 아래에 이어
 * 붙는 목록이 같은 목록으로 서야 방금 보던 흐름이 그대로 이어지고, 목록 화면이
 * 이미 받아둔 페이지도 재사용된다.
 *
 * 출처는 전체에서 들어온 경우만 남긴다 — 게시판에서 들어왔다면 그 게시판이 곧
 * 글의 소속 게시판이라 URL 없이 글에서 나온다.
 */
export function postHref(
  postId: number,
  query: { sort?: PostSort; from?: CategoryId | "ALL" } = {}
): string {
  const params = new URLSearchParams();
  if (query.sort && query.sort !== DEFAULT_POST_SORT) {
    params.set("sort", query.sort);
  }
  if (query.from === "ALL") params.set("from", "all");

  const search = params.toString();
  const base = `/community/board/detail/${postId}`;
  return search ? `${base}?${search}` : base;
}

/** 게시글 수정 경로. */
export function postEditHref(postId: number): string {
  return `${postHref(postId)}/edit`;
}

/**
 * URL 세그먼트를 정렬로. 사용자가 손댄 주소나 오래된 링크가 들어와도
 * 목록이 비지 않도록 모르는 값이면 기본 정렬로 읽는다.
 */
export function parsePostSort(value: string | undefined): PostSort {
  return POST_SORTS.includes(value as PostSort)
    ? (value as PostSort)
    : DEFAULT_POST_SORT;
}

/**
 * URL 세그먼트를 출처 게시판으로. 전체에서 들어온 것만 구분하면 되므로 그 외의
 * 값은 모두 없는 것으로 읽는다(글의 소속 게시판이 곧 출처가 된다).
 */
export function parseListOrigin(value: string | undefined): "ALL" | undefined {
  return value === "all" ? "ALL" : undefined;
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
