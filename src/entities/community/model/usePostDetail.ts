import { useQuery } from "@tanstack/react-query";
import { getPostDetail } from "../api/communityApi";
import type { Post } from "../types";

/**
 * 게시글 상세.
 *
 * 서버 컴포넌트가 이미 받아온 글이 있으면 `initialData` 로 넘겨 마운트 직후의
 * 재조회를 없앤다. 백엔드가 이 GET 에서 조회수를 올리므로, 서버·클라이언트가
 * 각각 부르면 새로고침 한 번에 조회수가 2 씩 오른다.
 *
 * 다만 서버 클라이언트에는 인증이 실리지 않아(`serverApiClient` 는
 * withCredentials 를 쓰지 않는다) 개인화 필드(currentUserVote,
 * currentUserBookmarked)가 비어 온다. 로그인 상태에서의 보정은 호출부가
 * `refetch` 로 처리한다.
 */
export function usePostDetail(postId: number, initialData?: Post) {
  return useQuery<Post, Error>({
    queryKey: ["community", "post", postId],
    queryFn: () => getPostDetail(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
    initialData,
  });
}
