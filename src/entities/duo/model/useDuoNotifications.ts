"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "@/shared/lib/logger";
import { duoKeys } from "./useDuoPosts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

/**
 * 듀오 실시간 알림(SSE) 구독. 수신 이벤트(`duo-notification`: REQUEST_ACCEPTED /
 * MATCH_CONFIRMED / REQUEST_CLOSED)마다 듀오 쿼리를 무효화해 목록·상세·내 요청을
 * 자동 갱신한다. 쿠키 인증이므로 로그인 상태(`enabled`)에서만 연결한다.
 * 멤버당 1연결 — 재구독 시 서버가 기존 연결을 종료한다.
 */
export function useDuoNotifications(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const source = new EventSource(
      `${API_BASE_URL}/duo/notifications/subscribe`,
      { withCredentials: true },
    );

    const handleNotification = () => {
      queryClient.invalidateQueries({ queryKey: duoKeys.all });
    };

    // 쿠키 인증이라 토큰 만료 시 EventSource 는 스스로 401→refresh 를 못 한다.
    // 연속 오류가 임계치를 넘으면 재연결 폭주를 막기 위해 구독을 끊는다.
    // (이후 갱신은 staleTime/페이지 재진입 시 일반 refetch 로 복구)
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;

    source.addEventListener("duo-notification", handleNotification);
    source.onopen = () => {
      consecutiveErrors = 0;
    };
    source.onerror = () => {
      consecutiveErrors += 1;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        logger.warn("Duo SSE 연속 오류로 구독 종료 — 새로고침 시 재연결");
        source.close();
      }
    };

    return () => {
      source.removeEventListener("duo-notification", handleNotification);
      source.close();
    };
  }, [enabled, queryClient]);
}
