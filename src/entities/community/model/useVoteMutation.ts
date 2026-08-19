import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vote, removeVote } from "../api/voteApi";
import { postDetailKey } from "./usePostDetail";
import type { Post, VoteRequest, VoteTargetType } from "../types";

/**
 * 게시글 투표는 상세 캐시를 invalidate 하지 않고 직접 써넣는다. 재조회가 곧
 * 조회수 증가라서다 (postDetailKey 주석 참고). 서버가 응답에 확정된 카운트를
 * 실어주므로 다시 받아올 것도 없다.
 *
 * 목록(`community/posts`)은 조회수와 무관한 엔드포인트라 그대로 무효화한다.
 * 상세를 보는 동안 목록 쿼리는 비활성이라 즉시 재조회되지도 않는다.
 */
export function useVote(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoteRequest) => vote(data),
    onSuccess: (data, variables) => {
      if (variables.targetType === "POST") {
        queryClient.setQueryData<Post>(postDetailKey(variables.targetId), (prev) =>
          prev
            ? {
                ...prev,
                upvoteCount: data.newUpvoteCount,
                downvoteCount: data.newDownvoteCount,
                currentUserVote: data.voteType,
              }
            : prev,
        );
        queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      }
    },
  });
}

/**
 * 투표 취소. DELETE 응답에는 카운트가 없어서 직전 투표를 기준으로 되돌린다.
 * 지우는 것은 내가 넣은 한 표이므로, 어느 쪽을 눌렀었는지만 알면 계산이 맞는다.
 */
export function useRemoveVote(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: VoteTargetType; targetId: number }) =>
      removeVote(targetType, targetId),
    onSuccess: (_data, variables) => {
      if (variables.targetType === "POST") {
        queryClient.setQueryData<Post>(postDetailKey(variables.targetId), (prev) => {
          if (!prev?.currentUserVote) return prev;
          const wasUpvote = prev.currentUserVote === "UPVOTE";
          return {
            ...prev,
            upvoteCount: prev.upvoteCount - (wasUpvote ? 1 : 0),
            downvoteCount: prev.downvoteCount - (wasUpvote ? 0 : 1),
            currentUserVote: null,
          };
        });
        queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      }
    },
  });
}
