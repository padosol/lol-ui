import { describe, expect, it } from "vitest";
import { isRepositoryPath } from "./repositoryRoutes";

/**
 * SSR 이 어느 백엔드로 갈지 고르는 표를 본다.
 *
 * <p>Ingress 와 어긋나면 같은 화면이 SSR 에서는 lol-server, 브라우저에서는 lol-repository 로
 * 가서 SSR 만 404 가 난다. 소환사 페이지는 SSR 프로필 조회가 실패하면 페이지 전체가 404 다.
 */
describe("lol-repository 경로 판별", () => {
  it.each([
    "/v1/game-data/seasons",
    "/v1/game-data/patch-notes/26.S1.1",
    "/v1/rankings",
    "/v1/rankings?platform=kr&queue=SOLO",
    "/v1/rankings/tier-cutoffs",
    "/v1/summoners/by-riot-id/hide%20on%20bush-KR1",
    "/v1/summoners/abc-puuid/leagues",
    "/v1/matches/KR_123",
  ])("%s 는 lol-repository 로 간다", (url) => {
    expect(isRepositoryPath(url)).toBe(true);
  });

  it.each([
    "/v1/community/posts",
    "/v1/members/me",
    "/v1/duo/posts",
    // Ingress 에 아직 없다(MP-152) — 그 전엔 lol-server 가 응답한다.
    "/v1/champion-stats/266",
    // prefix 는 경로 조각 단위다.
    "/v1/rankingsX",
    "/community/posts",
  ])("%s 는 lol-server 로 간다", (url) => {
    expect(isRepositoryPath(url)).toBe(false);
  });
});
