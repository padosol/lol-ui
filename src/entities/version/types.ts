export interface Version {
  versionId: number;
  /** 패치 버전 (예: `16.16`). 전적·챔피언 통계가 쓰는 축이다. */
  versionValue: string;
  /**
   * Data Dragon 정적 데이터 버전 (예: `16.16.1`).
   * 챔피언·아이템 JSON 경로는 이 값으로 만든다 — `versionValue` 로는 경로가 성립하지 않는다.
   * 아직 값이 채워지지 않은 과거 패치는 null 로 내려온다.
   */
  patchVersionData: string | null;
  createdAt: string;
}
