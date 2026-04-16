import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDuoPost,
  updateDuoPost,
  deleteDuoPost,
} from "../api/duoPostApi";
import type { CreateDuoPostRequest } from "../types";
import { duoKeys } from "./useDuoPosts";

export function useCreateDuoPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDuoPostRequest) => createDuoPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.posts() });
      queryClient.invalidateQueries({ queryKey: duoKeys.myPosts() });
    },
  });
}

export function useUpdateDuoPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: CreateDuoPostRequest;
    }) => updateDuoPost(postId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: duoKeys.postDetail(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: duoKeys.posts() });
      queryClient.invalidateQueries({ queryKey: duoKeys.myPosts() });
    },
  });
}

export function useDeleteDuoPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deleteDuoPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.posts() });
      queryClient.invalidateQueries({ queryKey: duoKeys.myPosts() });
    },
  });
}
