"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { useDebouncedCallback } from "@/shared/lib/useDebouncedCallback";
import { toast } from "@/shared/ui/toast";
import { addBookmark, removeBookmark } from "../api/bookmarkApi";
import type { Post } from "../types";
import { bookmarkKeys, postDetailKey } from "./bookmarkKeys";

const TOGGLE_DEBOUNCE_MS = 400;

/**
 * 북마크 토글.
 *
 * 이 리포에서 낙관적 업데이트를 쓰는 첫 훅이다. 다른 뮤테이션은 전부
 * `onSuccess → invalidateQueries` 한 가지인데 북마크만 다르게 가는 이유:
 * 토글은 누른 즉시 반응해야 하고, 왕복을 기다리면 연타 시 버튼이 제멋대로 깜빡인다.
 *
 * 낙관적 갱신을 `onMutate` 가 아니라 클릭 시점에 하는 이유도 같다.
 * 디바운스 때문에 `onMutate` 는 400ms 뒤에나 실행되어 화면이 그만큼 밀린다.
 */
export function useBookmarkToggle(postId: number) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => postDetailKey(postId), [postId]);

  // 연타 한 묶음에서 "첫 클릭 직전" 상태만 보관한다. 매 클릭마다 덮어쓰면
  // 롤백 대상이 이미 낙관적으로 바뀐 값이 되어 원래대로 못 돌아간다.
  const rollbackRef = useRef<Post | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: (bookmarked: boolean) =>
      bookmarked ? addBookmark(postId) : removeBookmark(postId),
    onError: () => {
      if (rollbackRef.current) {
        queryClient.setQueryData(queryKey, rollbackRef.current);
      }
      toast.error("북마크 처리에 실패했습니다.");
    },
    onSettled: () => {
      rollbackRef.current = undefined;
      // 스냅샷 복구는 즉각적인 되돌림일 뿐이고, 진짜 정답은 서버에서 다시 받는다.
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
  });

  const sendDebounced = useDebouncedCallback(
    (bookmarked: boolean) => mutation.mutate(bookmarked),
    TOGGLE_DEBOUNCE_MS,
  );

  const toggle = useCallback(async () => {
    // 진행 중인 refetch 가 낙관적 값을 덮어쓰지 않도록 먼저 취소한다.
    // 취소 후에 캐시를 다시 읽어야 그 사이 도착한 응답을 밟지 않는다.
    await queryClient.cancelQueries({ queryKey });

    const current = queryClient.getQueryData<Post>(queryKey);
    if (!current) return;

    const next = !current.currentUserBookmarked;
    if (rollbackRef.current === undefined) {
      rollbackRef.current = current;
    }
    queryClient.setQueryData<Post>(queryKey, {
      ...current,
      currentUserBookmarked: next,
    });

    // 연타해도 서버로는 마지막 상태 한 번만 나간다.
    sendDebounced(next);
  }, [queryClient, queryKey, sendDebounced]);

  return { toggle, isPending: mutation.isPending };
}
