/**
 * 북마크 쿼리 키. duoKeys 와 같은 factory 형태다.
 *
 * 기존 community 쿼리들은 인라인 문자열 배열을 쓰고 있어서, 그쪽 캐시를
 * invalidate 할 때는 리터럴을 그대로 맞춰 써야 한다 (communityKeys 전면 정리는 별건).
 */
export const bookmarkKeys = {
  all: ["community", "bookmarks"] as const,
  myList: (page: number) => [...bookmarkKeys.all, "my", page] as const,
};

/** 게시글 상세 캐시 키 — usePostDetail.ts 의 리터럴과 반드시 같아야 한다. */
export const postDetailKey = (postId: number) =>
  ["community", "post", postId] as const;
