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

    source.addEventListener("duo-notification", handleNotification);
    source.onerror = () => {
      // EventSource 는 기본적으로 자동 재연결한다. 닫힌 경우만 로깅.
      if (source.readyState === EventSource.CLOSED) {
        logger.warn("Duo SSE connection closed");
      }
    };

    return () => {
      source.removeEventListener("duo-notification", handleNotification);
      source.close();
    };
  }, [enabled, queryClient]);
}
