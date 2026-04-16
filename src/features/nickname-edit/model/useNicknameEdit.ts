"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, updateNickname } from "@/entities/auth";

export function useNicknameEdit() {
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile);
      setError(null);
    },
    onError: () => {
      setError("닉네임 변경에 실패했습니다. 다시 시도해주세요.");
    },
  });

  function validate(nickname: string): string | null {
    const trimmed = nickname.trim();
    if (!trimmed) return "닉네임을 입력해주세요.";
    if (trimmed.length < 2) return "닉네임은 2자 이상이어야 합니다.";
    if (trimmed.length > 16) return "닉네임은 16자 이하여야 합니다.";
    return null;
  }

  return {
    updateNickname: mutation.mutate,
    isPending: mutation.isPending,
    error,
    setError,
    validate,
  };
}
