"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRsoStatus, disconnectRso } from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

export function useRsoConnect() {
  const queryClient = useQueryClient();

  const { data: rsoProfile, isLoading } = useQuery({
    queryKey: ["rso-status"],
    queryFn: getRsoStatus,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectRso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rso-status"] });
    },
  });

  function initiateRsoConnect() {
    window.location.href = `${API_BASE_URL}/auth/rso`;
  }

  return {
    rsoProfile: rsoProfile ?? null,
    isLoading,
    isLinked: !!rsoProfile,
    initiateRsoConnect,
    disconnectRso: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    disconnectError: disconnectMutation.error,
  };
}
