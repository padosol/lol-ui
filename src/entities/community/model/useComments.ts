import { useQuery } from "@tanstack/react-query";
import { getComments } from "../api/commentApi";
import type { Comment } from "../types";

export function useComments(postId: number) {
  return useQuery<Comment[], Error>({
    queryKey: ["community", "comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
  });
}
