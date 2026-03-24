import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, updatePost, deletePost } from "../api/communityApi";
import type { CreatePostRequest, UpdatePostRequest } from "../types";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: UpdatePostRequest }) =>
      updatePost(postId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community", "post", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}
