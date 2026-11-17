import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { recordPostViewAndSync } from "./recordPostView";

/**
 * `enabled` 가 되면 이 글의 조회를 한 번 기록한다.
 *
 * ref 로 마지막에 기록한 postId 를 기억해, 리렌더·StrictMode 의 effect 재실행에도
 * 같은 글을 두 번 보내지 않는다. 다른 글로 바뀌면 다시 기록한다.
 */
export function useRecordPostView(postId: number, enabled: boolean): void {
  const queryClient = useQueryClient();
  const recordedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || recordedRef.current === postId) return;
    recordedRef.current = postId;
    void recordPostViewAndSync(queryClient, postId);
  }, [enabled, postId, queryClient]);
}
