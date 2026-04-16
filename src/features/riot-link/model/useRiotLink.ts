"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  useAuthStore,
  disconnectSocialAccount,
  getMyProfile,
} from "@/entities/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

export function useRiotLink() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [confirming, setConfirming] = useState(false);

  const riotAccounts = user?.socialAccounts.filter((a) => a.provider === "RIOT") ?? [];

  function initiateLink() {
    window.location.href = `${API_BASE_URL}/members/me/social-accounts/link/riot`;
  }

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      for (const account of riotAccounts) {
        await disconnectSocialAccount(account.id);
      }
    },
    onSuccess: async () => {
      const profile = await getMyProfile();
      setUser(profile);
      setConfirming(false);
    },
  });

  return {
    riotAccounts,
    isLinked: riotAccounts.length > 0,
    initiateLink,
    disconnectAll: disconnectAllMutation.mutate,
    isDisconnecting: disconnectAllMutation.isPending,
    confirming,
    setConfirming,
  };
}
