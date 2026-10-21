import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { getPosts, searchPosts, getMyPosts } from "../api/communityApi";
import type { PostListResponse, CategoryId, PostSort, PostPeriod } from "../types";

export function usePosts(
  params: {
    categoryId?: CategoryId;
    sort?: PostSort;
    period?: PostPeriod;
  },
  /**
   * 서버가 렌더한 첫 페이지. 이게 있으면 마운트 직후 fetch 없이 바로 목록이 선다.
   * 정렬을 바꾸거나 다음 페이지를 부르면 그때부터 클라이언트 쿼리가 이어받는다.
   */
  initialPage?: PostListResponse
) {
  return useInfiniteQuery<PostListResponse, Error>({
    queryKey: [
      "community",
      "posts",
      params.categoryId,
      params.sort,
      params.period,
    ],
    queryFn: ({ pageParam }) =>
      getPosts({
        categoryId: params.categoryId,
        sort: params.sort,
        period: params.period,
        page: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasNext ? (lastPageParam as number) + 1 : undefined,
    staleTime: 1 * 60 * 1000,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [0] }
      : undefined,
    // 정렬을 바꾸는 동안 목록이 통째로 "로딩중" 으로 바뀌지 않게 이전 결과를 남긴다.
    placeholderData: keepPreviousData,
  });
}

export function useSearchPosts(keyword: string, page: number = 0) {
  return useQuery<PostListResponse, Error>({
    queryKey: ["community", "search", keyword, page],
    queryFn: () => searchPosts({ keyword, page }),
    enabled: keyword.length > 0,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * 마이페이지 "내가 쓴 글" 목록. 북마크처럼 페이지 단위다.
 * 키를 ["community", "posts"] 아래에 둬서 글 작성·수정·삭제가 이 목록도 함께 무효화하게 한다.
 */
export function useMyPosts(page: number = 0) {
  return useQuery<PostListResponse, Error>({
    queryKey: ["community", "posts", "mine", page],
    queryFn: () => getMyPosts(page),
    staleTime: 1 * 60 * 1000,
  });
}
