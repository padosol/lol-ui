"use client";

import { useEffect } from "react";
import { revalidateSession } from "../model/revalidateSession";

// StrictMode·재마운트에도 전체 페이지 로드당 1회만 확인한다.
let started = false;

export default function SessionBootstrap() {
  useEffect(() => {
    if (started) return;
    started = true;

    // localStorage persist 는 동기 복원이라 effect 시점엔 이미 복원돼 있다.
    void revalidateSession();
  }, []);

  return null;
}
