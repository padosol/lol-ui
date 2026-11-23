"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, withdrawMember } from "@/entities/auth";
import { getApiErrorMessage } from "@/shared/api/error";
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
      // errorMessage 는 { errorCode, message } 객체다. 통째로 넣으면 JSX 렌더에서 터진다.
      setError(getApiErrorMessage(err) ?? t("error"));
    },
  });

  return {
    withdraw: mutation.mutate,
    isPending: mutation.isPending,
    error,
  };
}
