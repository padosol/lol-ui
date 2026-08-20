import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, updateComment, deleteComment } from "../api/commentApi";
import { postDetailKey } from "./usePostDetail";
import type { CreateCommentRequest, Post, UpdateCommentRequest } from "../types";

/**
 * 댓글 수만 ±1 한다. 상세를 통째로 다시 받으면 조회수가 함께 오른다
 * (postDetailKey 주석 참고). 댓글 목록은 조회수와 무관한 별도 엔드포인트라
 * 그대로 재조회한다 — 대댓글이 어디에 붙는지는 서버가 정답이다.
 */
function useCommentCountDelta() {
  const queryClient = useQueryClient();

  return (postId: number, delta: number) => {
    queryClient.setQueryData<Post>(postDetailKey(postId), (prev) =>
      prev
        ? { ...prev, commentCount: Math.max(0, prev.commentCount + delta) }
        : prev,
    );
  };
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  const applyCommentCountDelta = useCommentCountDelta();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      applyCommentCountDelta(postId, 1);
    },
  });
}

export function useUpdateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: UpdateCommentRequest }) =>
      updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();
  const applyCommentCountDelta = useCommentCountDelta();

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      applyCommentCountDelta(postId, -1);
    },
  });
}
