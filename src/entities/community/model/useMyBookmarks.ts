import { useQuery } from "@tanstack/react-query";
import { getMyBookmarks } from "../api/bookmarkApi";
import { bookmarkKeys } from "./bookmarkKeys";

/**
 * 마이페이지 "북마크한 글" 목록.
 * 공개 목록(usePosts)과 달리 무한스크롤이 아니라 페이지 단위다 — useMyDuoPosts 와 같은 형태.
 */
export function useMyBookmarks(page: number = 0) {
  return useQuery({
    queryKey: bookmarkKeys.myList(page),
    queryFn: () => getMyBookmarks(page),
    staleTime: 1 * 60 * 1000,
  });
}
