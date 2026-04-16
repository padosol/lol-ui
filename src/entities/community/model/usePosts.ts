import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPosts, searchPosts, getMyPosts } from "../api/communityApi";
import type { PostListResponse, PostCategory, PostSort, PostPeriod } from "../types";

export function usePosts(params: {
  category?: PostCategory;
  sort?: PostSort;
  period?: PostPeriod;
}) {
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
