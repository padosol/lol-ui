"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRiotAccounts, disconnectRiotAccount } from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

const SERVER_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function useRsoConnect() {
  const queryClient = useQueryClient();

  const { data: riotAccounts = [], isLoading } = useQuery({
    queryKey: ["riot-accounts"],
    queryFn: getRiotAccounts,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: (linkId: number) => disconnectRiotAccount(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riot-accounts"] });
    },
  });

  function initiateRsoConnect() {
    window.location.href = `${SERVER_ROOT_URL}/oauth2/authorize/riot`;
  }

  return {
    riotAccounts,
    isLoading,
    isLinked: riotAccounts.length > 0,
    initiateRsoConnect,
    disconnectRiotAccount: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    disconnectError: disconnectMutation.error,
  };
}
