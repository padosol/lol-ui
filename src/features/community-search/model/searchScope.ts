/**
 * 검색 범위. 아직 백엔드 검색 API 가 keyword 만 받으므로 UI 상태로만 존재한다.
 * (서버가 범위 파라미터를 지원하면 searchPosts 요청에 실어 보내면 된다)
 */
export const SEARCH_SCOPES = [
  "TITLE_CONTENT",
  "TITLE",
  "CONTENT",
  "AUTHOR",
] as const;

export type SearchScope = (typeof SEARCH_SCOPES)[number];

export const DEFAULT_SEARCH_SCOPE: SearchScope = "TITLE_CONTENT";
