import type { AuthStatus } from "@/entities/auth";
import type { Post } from "@/entities/community";

export interface DetailSync {
  /** 세션을 다시 확인하고, 로그인이면 글을 다시 받는다. */
  revalidate: boolean;
  /** 조회를 기록해도 된다. */
  recordView: boolean;
}

/**
 * 상세 화면이 세션 재확인·조회 기록 중 무엇을 할지 정한다.
 *
 * <p>세션은 로그인인데 받아 둔 글이 비로그인 응답이면 개인화(투표·북마크)가 비어 있고, 이대로
 * 기록하면 비로그인 방문자로 센다. 읽는 동안 토큰이 만료된 채 다른 글로 이동한 경우다. 이때는
 * 세션을 다시 확인해 쿠키를 새로 받고 재조회한 뒤에 기록한다 — 기록 응답의 조회수가 재조회보다
 * 늦게 도착해 덮이지도 않는다. 한 글에서 한 번만 시도하고(`personalizationAttempted`), 그 뒤에는
 * 결과와 무관하게 기록을 풀어 준다. 필드가 없는 응답(백엔드 배포 전)도 비로그인으로 본다.
 */
export function decideDetailSync(
  status: AuthStatus,
  post: Pick<Post, "viewerAuthenticated"> | undefined,
  personalizationAttempted: boolean,
): DetailSync {
  if (status === "unknown" || post === undefined) {
    return { revalidate: false, recordView: false };
  }
  if (status === "authenticated" && !post.viewerAuthenticated && !personalizationAttempted) {
    return { revalidate: true, recordView: false };
  }
  return { revalidate: false, recordView: true };
}
