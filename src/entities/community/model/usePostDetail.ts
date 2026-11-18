import { useQuery } from "@tanstack/react-query";
import { getPostDetail } from "../api/communityApi";
import type { Post } from "../types";

/**
 * 게시글 상세 캐시 키.
 *
 * **이 캐시는 invalidate 하지 않는다.** 조회수는 상세 GET 이 아니라
 * `POST /community/posts/{id}/views` 가 센다. 그래도 무효화하면 화면에 떠 있는
 * 상세 쿼리가 곧바로 다시 조회되므로, 불필요한 재요청을 막기 위해 invalidate
 * 금지는 유지한다.
 *
 * 다른 동작 때문에 상세가 낡았다면 `setQueryData` 로 바뀐 필드만 써넣는다.
 * 투표는 응답이 새 카운트를 주고(VoteResponse), 댓글 수는 ±1 이면 된다.
 */
export const postDetailKey = (postId: number) =>
  ["community", "post", postId] as const;

/**
 * 게시글 상세.
 *
 * 서버 컴포넌트가 이미 받아온 글이 있으면 `initialData` 로 넘겨 마운트 직후의
 * 재조회를 없앤다.
 *
 * SSR 이 로그인 토큰을 실어 개인화(currentUserVote, currentUserBookmarked)해
 * 내려주고, 서버가 비로그인으로 응답했을 때만(`viewerAuthenticated` false)
 * 호출부가 `refetch` 로 다시 받는다.
 */
export function usePostDetail(postId: number, initialData?: Post) {
  return useQuery<Post, Error>({
    queryKey: postDetailKey(postId),
    queryFn: () => getPostDetail(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
    initialData,
  });
}
