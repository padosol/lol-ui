"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, withdrawMember } from "@/entities/auth";
import axios from "axios";
import { useTranslations } from "next-intl";

export function useMemberWithdrawal() {
  const t = useTranslations("mypage.withdrawModal");
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => withdrawMember(),
    onSuccess: () => {
      clearAuth();
      router.replace("/login");
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.data?.errorMessage) {
        setError(err.response.data.errorMessage);
      } else {
        setError(t("error"));
      }
    },
  });

  return {
    withdraw: mutation.mutate,
    isPending: mutation.isPending,
    error,
  };
}
