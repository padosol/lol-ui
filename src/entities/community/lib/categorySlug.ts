import type { CategoryTree } from "../types";

/**
 * 게시판 코드(GENERAL)와 URL 세그먼트(general) 사이의 변환.
 *
 * 서버가 slug 를 따로 내려주지 않아 code 를 소문자로 눕힌 것을 URL 로 쓴다.
 * 되돌릴 때 toUpperCase 로 추측하지 않고 항상 트리에서 찾는 이유는, 코드에
 * 언더스코어나 숫자가 섞여도(FREE_TALK) 규칙을 다시 손대지 않기 위해서다.
 * 서버가 slug 필드를 주기 시작하면 이 파일만 바꾸면 된다.
 */
export function categoryCodeToSlug(code: string): string {
  return code.toLowerCase();
}

/** 게시판 목록 경로. "ALL" 은 게시판이 아니라 커뮤니티 첫 화면이다. */
export function categoryHref(code: string): string {
  return code === "ALL" ? "/community" : `/community/board/${categoryCodeToSlug(code)}`;
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
 * URL 세그먼트로 게시판을 찾는다. 숨김 게시판도 찾아준다 — 링크를 직접 받은
 * 사용자에게 404 를 주는 것보다 글 목록을 보여주는 편이 낫다.
 *
 * 못 찾으면 null. 호출부에서 notFound() 로 처리한다.
 */
export function findCategoryBySlug(tree: CategoryTree, slug: string) {
  const normalized = slug.toLowerCase();
  for (const group of tree.groups) {
    for (const category of group.categories) {
      if (categoryCodeToSlug(category.code) === normalized) {
        return category;
      }
    }
  }
  return null;
}
