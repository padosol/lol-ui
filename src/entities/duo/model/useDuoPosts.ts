import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getDuoPosts, getMyDuoPosts } from "../api/duoPostApi";
import type { DuoPostListResponse, DuoPostFilters } from "../types";

export const duoKeys = {
  all: ["duo"] as const,
  posts: () => [...duoKeys.all, "posts"] as const,
  postList: (params: Omit<DuoPostFilters, "page">) =>
    [...duoKeys.posts(), params] as const,
  postDetail: (id: number) => [...duoKeys.posts(), "detail", id] as const,
  myPosts: () => [...duoKeys.all, "my-posts"] as const,
  myRequests: () => [...duoKeys.all, "my-requests"] as const,
};

export function useDuoPosts(params: Omit<DuoPostFilters, "page">) {
  return useInfiniteQuery<DuoPostListResponse, Error>({
    queryKey: duoKeys.postList(params),
    queryFn: ({ pageParam }) =>
      getDuoPosts({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasNext ? (lastPageParam as number) + 1 : undefined,
    staleTime: 1 * 60 * 1000,
  });
}

export function useMyDuoPosts(page: number = 0) {
  return useQuery<DuoPostListResponse, Error>({
    queryKey: [...duoKeys.myPosts(), page],
    queryFn: () => getMyDuoPosts(page),
    staleTime: 1 * 60 * 1000,
  });
}
