/**
 * lol-repository 가 응답하는 경로(Riot 데이터: 게임 데이터·랭킹·소환사·전적).
 *
 * 브라우저 요청은 Ingress 가 이 prefix 로 갈라 보낸다(MP-151·153·154). SSR 은 Ingress 를
 * 거치지 않고 API_URL_INTERNAL 로 바로 가므로 서버 클라이언트가 같은 표를 따라야 한다.
 * lol-deploy 의 Ingress 경로 표(`_ingress.tpl`)를 바꾸면 여기도 바꾼다.
 * champion-stats 는 Ingress MP-152 와 함께 넣는다.
 */
const REPOSITORY_PATH_PREFIXES = [
  "/v1/game-data",
  "/v1/rankings",
  "/v1/summoners",
  "/v1/matches",
] as const;

/** Ingress 의 `pathType: Prefix` 처럼 경로 조각 단위로 맞춘다 — `/v1/rankingsX` 는 아니다. */
export function isRepositoryPath(url: string): boolean {
  return REPOSITORY_PATH_PREFIXES.some(
    (prefix) =>
      url === prefix ||
      url.startsWith(`${prefix}/`) ||
      url.startsWith(`${prefix}?`)
  );
}
