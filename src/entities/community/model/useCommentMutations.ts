import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, updateComment, deleteComment } from "../api/commentApi";
import type { CreateCommentRequest, UpdateCommentRequest } from "../types";

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community", "post", postId] });
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

  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community", "post", postId] });
    },
  });
}
