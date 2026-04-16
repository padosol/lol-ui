import { useQuery } from "@tanstack/react-query";
import { getDuoPostDetail } from "../api/duoPostApi";
import type { DuoPost } from "../types";
import { duoKeys } from "./useDuoPosts";

export function useDuoPostDetail(postId: number | null) {
  return useQuery<DuoPost, Error>({
    queryKey: duoKeys.postDetail(postId!),
    queryFn: () => getDuoPostDetail(postId!),
    enabled: postId !== null,
    staleTime: 30 * 1000,
  });
}
