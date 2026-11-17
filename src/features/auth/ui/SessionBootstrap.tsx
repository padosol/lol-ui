"use client";

import { useEffect } from "react";
import { getMyProfile, useAuthStore } from "@/entities/auth";
import { bootstrapSession } from "../model/bootstrapSession";

// StrictMode·재마운트에도 전체 페이지 로드당 1회만 확인한다.
let started = false;

export default function SessionBootstrap() {
  useEffect(() => {
    if (started) return;
    started = true;

    // localStorage persist 는 동기 복원이라 effect 시점엔 이미 복원돼 있다.
    const state = useAuthStore.getState();
    void bootstrapSession({
      hasStoredUser: state.user !== null,
      fetchProfile: () => getMyProfile({ skipAuthRedirect: true }),
      setUser: state.setUser,
      clearAuth: state.clearAuth,
      setStatus: state.setStatus,
    });
  }, []);

  return null;
}
