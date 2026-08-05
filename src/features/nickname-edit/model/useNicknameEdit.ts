"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, updateNickname } from "@/entities/auth";
import { useTranslations } from "next-intl";

export function useNicknameEdit() {
  const t = useTranslations("mypage.nickname");
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile);
      setError(null);
    },
    onError: () => {
      setError(t("error"));
    },
  });

  function validate(nickname: string): string | null {
    const trimmed = nickname.trim();
    if (!trimmed) return t("required");
    if (trimmed.length < 2) return t("tooShort");
    if (trimmed.length > 16) return t("tooLong");
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
