import { useQuery } from "@tanstack/react-query";
import { getDuoMatchResult } from "../api/duoRequestApi";
import type { MatchActionResponse } from "../types";
import { duoKeys } from "./useDuoPosts";

/**
 * 매칭 결과(파트너 정보) 조회. 매칭 당사자가 아닐 때 호출하면 403 이므로
 * 소유자의 MATCHED 게시글 / 요청자의 CONFIRMED 요청에서만 `enabled` 로 켠다.
 */
export function useDuoMatchResult(postId: number, enabled: boolean) {
  return useQuery<MatchActionResponse, Error>({
    queryKey: duoKeys.matchResult(postId),
    queryFn: () => getDuoMatchResult(postId),
    enabled,
    staleTime: 5 * 60 * 1000,
    // 비당사자는 403이 정상 응답이므로 글로벌 retry(1회)를 끈다
    retry: false,
  });
}
