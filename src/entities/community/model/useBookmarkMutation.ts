"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { useDebouncedCallback } from "@/shared/lib/useDebouncedCallback";
import { addBookmark, removeBookmark } from "../api/bookmarkApi";
import type { Post } from "../types";
import { bookmarkKeys, postDetailKey } from "./bookmarkKeys";

const TOGGLE_DEBOUNCE_MS = 400;

interface UseBookmarkToggleOptions {
  /** 실패를 사용자에게 알리는 방법은 호출부가 정한다 (entities 는 UI 를 모른다). */
  onError?: () => void;
}

/**
 * 북마크 토글.
 *
 * 이 리포에서 낙관적 업데이트를 쓰는 첫 훅이다. 다른 뮤테이션은 전부
 * `onSuccess → invalidateQueries` 한 가지인데 북마크만 다르게 가는 이유는 토글이라서다.
 * 누른 즉시 반응해야 하고, 왕복을 기다리면 연타 시 버튼이 제멋대로 깜빡인다.
 *
 * 세 가지를 의도적으로 하지 않는다.
 *
 * 1. **상세 캐시를 invalidate 하지 않는다.** 응답이 오는 시점엔 이미 다음 클릭의
 *    낙관적 값이 화면에 있을 수 있고, refetch 가 그걸 덮으면 버튼이 되돌아갔다 온다
 *    (= 이 훅이 막으려던 깜빡임을 스스로 만든다). 확정값을 직접 써넣는다.
 * 2. **Post 전체를 스냅샷하지 않는다.** 통짜로 되돌리면 그 사이 바뀐 추천 수·조회 수까지
 *    같이 되감긴다. 되돌릴 대상은 boolean 하나다.
 * 3. **서버 상태와 같은 요청은 보내지 않는다.** 짝수 번 연타하면 최종 의도가 원래
 *    상태와 같은데, 그걸 그대로 보내면 서버는 409/404 를 준다.
 */
export function useBookmarkToggle(
  postId: number,
  options?: UseBookmarkToggleOptions,
) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => postDetailKey(postId), [postId]);

  // 서버가 확인해준 마지막 상태. 낙관적 값과 반드시 구분해서 들고 있어야
  // 보낼 필요 없는 요청을 걸러내고, 실패했을 때 되돌릴 곳을 안다.
  const serverStateRef = useRef<boolean | null>(null);
  // 아직 발사되지 않은 클릭이 남아 있는지. 남아 있으면 서버 응답으로
  // 화면을 건드리면 안 된다 — 더 최신 의도가 이미 화면에 있다.
  const hasPendingRef = useRef(false);

  const writeBookmarked = useCallback(
    (bookmarked: boolean) => {
      queryClient.setQueryData<Post>(queryKey, (prev) =>
        prev ? { ...prev, currentUserBookmarked: bookmarked } : prev,
      );
    },
    [queryClient, queryKey],
  );

  const mutation = useMutation({
    mutationFn: async (bookmarked: boolean) => {
      if (bookmarked) await addBookmark(postId);
      else await removeBookmark(postId);
      return bookmarked;
    },
    onSuccess: (bookmarked) => {
      serverStateRef.current = bookmarked;
      if (!hasPendingRef.current) writeBookmarked(bookmarked);
      // 목록은 서버에서 다시 받아야 한다 (글이 추가/제거됐으므로).
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
    onError: () => {
      if (!hasPendingRef.current && serverStateRef.current !== null) {
        writeBookmarked(serverStateRef.current);
      }
      options?.onError?.();
    },
  });

  const sendDebounced = useDebouncedCallback((bookmarked: boolean) => {
    hasPendingRef.current = false;
    // 짝수 번 연타 등으로 최종 의도가 서버 상태와 같으면 보낼 것이 없다.
    if (serverStateRef.current === bookmarked) return;
    mutation.mutate(bookmarked);
  }, TOGGLE_DEBOUNCE_MS);

  const toggle = useCallback(async () => {
    // 진행 중인 refetch 가 낙관적 값을 덮어쓰지 않도록 먼저 취소하고,
    // 취소가 끝난 뒤에 캐시를 읽어야 그 사이 도착한 응답을 밟지 않는다.
    await queryClient.cancelQueries({ queryKey });

    const current = queryClient.getQueryData<Post>(queryKey);
    if (!current) return;

    // 첫 토글 시점의 화면 값이 곧 서버 값이다 (서버에서 받아온 것이므로).
    if (serverStateRef.current === null) {
      serverStateRef.current = current.currentUserBookmarked;
    }

    const next = !current.currentUserBookmarked;
    writeBookmarked(next);
    hasPendingRef.current = true;
    sendDebounced(next);
  }, [queryClient, queryKey, sendDebounced, writeBookmarked]);

  return { toggle };
}

/**
 * 북마크 해제 전용. 북마크 목록에서 바로 빼기 위한 것으로, 목록의 모든 항목은
 * 정의상 북마크된 상태라 토글이 필요 없다.
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => removeBookmark(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
      queryClient.invalidateQueries({ queryKey: postDetailKey(postId) });
    },
  });
}
