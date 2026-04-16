import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vote, removeVote } from "../api/voteApi";
import type { VoteRequest, VoteTargetType } from "../types";

export function useVote(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoteRequest) => vote(data),
    onSuccess: (_data, variables) => {
      if (variables.targetType === "POST") {
        queryClient.invalidateQueries({ queryKey: ["community", "post", variables.targetId] });
        queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      }
    },
  });
}

export function useRemoveVote(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: VoteTargetType; targetId: number }) =>
      removeVote(targetType, targetId),
    onSuccess: (_data, variables) => {
      if (variables.targetType === "POST") {
        queryClient.invalidateQueries({ queryKey: ["community", "post", variables.targetId] });
        queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      }
    },
  });
}
