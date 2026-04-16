import { useQuery } from "@tanstack/react-query";
import { getPostDetail } from "../api/communityApi";
import type { Post } from "../types";

export function usePostDetail(postId: number) {
  return useQuery<Post, Error>({
    queryKey: ["community", "post", postId],
    queryFn: () => getPostDetail(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
  });
}
