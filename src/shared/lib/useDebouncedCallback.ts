"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * 마지막 호출만 delay 후에 실행한다.
 *
 * 낙관적 업데이트와 짝을 이루는 토글(북마크 등)에서 필요하다. 디바운스가 없으면
 * 연타 시 POST 와 DELETE 가 뒤바뀐 순서로 서버에 도착할 수 있고, 그러면
 * 서버는 "북마크됨" 인데 화면은 "해제됨" 인 상태가 되어 새로고침 전까지 아무도 모른다.
 * 서버를 멱등하게 만들어도 도착 순서 문제는 풀리지 않으므로, 요청 자체를 하나로 줄인다.
 *
 * 대기 중인 호출이 있는 상태로 언마운트되면 그 호출을 즉시 실행한다(flush).
 * 사용자가 마지막으로 누른 상태가 서버에 반영되지 않은 채 페이지를 떠나면 안 된다.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<A | null>(null);
  const callbackRef = useRef(callback);

  // 렌더 중 ref 에 쓰지 않는다 — 최신 콜백은 커밋 후에 반영한다.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current === null) return;
      clearTimeout(timerRef.current);
      const args = pendingArgsRef.current;
      pendingArgsRef.current = null;
      if (args) callbackRef.current(...args);
    };
  }, []);

  return useCallback(
    (...args: A) => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      pendingArgsRef.current = args;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const pending = pendingArgsRef.current;
        pendingArgsRef.current = null;
        if (pending) callbackRef.current(...pending);
      }, delayMs);
    },
    [delayMs],
  );
}
