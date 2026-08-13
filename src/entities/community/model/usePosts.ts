import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { getPosts, searchPosts, getMyPosts } from "../api/communityApi";
import type { PostListResponse, PostCategory, PostSort, PostPeriod } from "../types";

export function usePosts(
  params: {
    category?: PostCategory;
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
    queryKey: ["community", "posts", params.category, params.sort, params.period],
    queryFn: ({ pageParam }) =>
      getPosts({
        category: params.category,
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

export function useMyPosts(page: number = 0) {
  return useQuery<PostListResponse, Error>({
    queryKey: ["community", "my-posts", page],
    queryFn: () => getMyPosts(page),
    staleTime: 1 * 60 * 1000,
  });
}
