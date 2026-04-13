"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, withdrawMember } from "@/entities/auth";
import axios from "axios";

export function useMemberWithdrawal() {
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
        setError("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    },
  });

  return {
    withdraw: mutation.mutate,
    isPending: mutation.isPending,
    error,
  };
}
