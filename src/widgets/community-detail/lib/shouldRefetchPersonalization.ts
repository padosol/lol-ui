import type { AuthStatus } from "@/entities/auth";
import type { Post } from "@/entities/community";

/**
 * 세션이 로그인으로 확정됐는데 받아 둔 글이 비로그인 응답이면 개인화(투표·북마크)가
 * 비어 있으므로 다시 받아야 한다. 필드가 없는 응답(백엔드 배포 전)도 비로그인으로 본다.
 */
export function shouldRefetchPersonalization(
  status: AuthStatus,
  post: Pick<Post, "viewerAuthenticated"> | undefined,
): boolean {
  return status === "authenticated" && !!post && !post.viewerAuthenticated;
}
