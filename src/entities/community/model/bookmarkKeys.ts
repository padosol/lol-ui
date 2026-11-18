/**
 * 북마크 쿼리 키. duoKeys 와 같은 factory 형태다.
 *
 * 기존 community 쿼리들은 인라인 문자열 배열을 쓰고 있어서, 그쪽 캐시를
 * invalidate 할 때는 리터럴을 그대로 맞춰 써야 한다 (communityKeys 전면 정리는 별건).
 * 게시글 상세만은 예외로 `postDetailKey` 헬퍼가 usePostDetail.ts 에 있다 —
 * 불필요한 재요청을 막기 위해 invalidate 하지 않는다는 규칙이 따로 있어서다.
 */
export const bookmarkKeys = {
  all: ["community", "bookmarks"] as const,
  myList: (page: number) => [...bookmarkKeys.all, "my", page] as const,
};
