import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDuoRequest,
  acceptDuoRequest,
  confirmDuoRequest,
  rejectDuoRequest,
  cancelDuoRequest,
} from "../api/duoRequestApi";
import type { CreateDuoRequestPayload } from "../types";
import { duoKeys } from "./useDuoPosts";

export function useCreateDuoRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: CreateDuoRequestPayload;
    }) => createDuoRequest(postId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: duoKeys.postDetail(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: duoKeys.myRequests() });
    },
  });
}

export function useAcceptDuoRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => acceptDuoRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.all });
    },
  });
}

export function useConfirmDuoRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => confirmDuoRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.all });
    },
  });
}

export function useRejectDuoRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => rejectDuoRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.all });
    },
  });
}

export function useCancelDuoRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) => cancelDuoRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.all });
    },
  });
}
