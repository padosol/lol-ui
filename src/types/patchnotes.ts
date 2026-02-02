// 패치노트 관련 타입 정의

// 변경 유형
export type ChangeType =
  | "buff"
  | "nerf"
  | "adjust"
  | "new"
  | "rework"
  | "bugfix";

// 패치 버전 목록 아이템
export interface PatchVersion {
  version: string;
  releaseDate: string;
  highlights: string[];
}

// 챔피언 변경사항
export interface ChampionChange {
  championId: number;
  championName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 아이템 변경사항
export interface ItemChange {
  itemId: number;
  itemName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 시스템 변경사항
export interface SystemChange {
  category: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 변경 상세 내용 (Before → After 형식)
export interface ChangeDetail {
  attribute: string;
  before: string;
  after: string;
}

// 패치노트 상세
export interface PatchNote {
  version: string;
  releaseDate: string;
  champions: ChampionChange[];
  items: ItemChange[];
  systems: SystemChange[];
}

// 패치 버전 목록 응답
export interface PatchVersionsResponse {
  content: PatchVersion[];
  hasNext: boolean;
}

// 패치노트 상세 응답
export interface PatchNoteResponse {
  version: string;
  releaseDate: string;
  champions: ChampionChange[];
  items: ItemChange[];
  systems: SystemChange[];
}
