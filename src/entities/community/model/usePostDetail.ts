import { useQuery } from "@tanstack/react-query";
import { getPostDetail } from "../api/communityApi";
import type { Post } from "../types";

/**
 * 게시글 상세 캐시 키.
 *
 * **이 캐시는 invalidate 하지 않는다.** 무효화하면 화면에 떠 있는 상세 쿼리가
 * 곧바로 다시 조회되는데, 백엔드가 GET /community/posts/{id} 에서 조회수를 올려
 * 재조회 한 번이 곧 조회수 1 이다. 추천을 누르거나 댓글을 달았을 뿐인데 조회수가
 * 오르는 일이 실제로 있었다.
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
 * 재조회를 없앤다. 위와 같은 이유로, 서버·클라이언트가 각각 부르면 새로고침
 * 한 번에 조회수가 2 씩 오른다.
 *
 * 다만 서버 클라이언트에는 인증이 실리지 않아(`serverApiClient` 는
 * withCredentials 를 쓰지 않는다) 개인화 필드(currentUserVote,
 * currentUserBookmarked)가 비어 온다. 로그인 상태에서의 보정은 호출부가
 * `refetch` 로 처리한다.
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
