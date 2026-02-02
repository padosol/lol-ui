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
  championKey: string; // 영문 ID (예: "Aatrox")
  championName: string; // 한글 이름 (예: "아트록스")
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

// 아레나 챔피언 변경사항
export interface ArenaChampionChange {
  championId: number;
  championKey: string; // 영문 ID (예: "Aatrox")
  championName: string; // 한글 이름 (예: "아트록스")
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 아레나 시스템 변경사항
export interface ArenaSystemChange {
  category: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 아레나 변경사항
export interface ArenaChanges {
  champions: ArenaChampionChange[];
  systems: ArenaSystemChange[];
}

// 무작위 총력전(ARAM) 챔피언 변경사항
export interface AramChampionChange {
  championId: number;
  championKey: string; // 영문 ID (예: "Aatrox")
  championName: string; // 한글 이름 (예: "아트록스")
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 무작위 총력전(ARAM) 시스템 변경사항
export interface AramSystemChange {
  category: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

// 무작위 총력전(ARAM) 변경사항
export interface AramChanges {
  champions: AramChampionChange[];
  systems: AramSystemChange[];
}

// 메타 예측
export interface MetaPrediction {
  category: string;
  predictions: string[];
}

// 요약 통계
export interface PatchSummary {
  championBuffs: number;
  championNerfs: number;
  championAdjusts: number;
  itemBuffs: number;
  itemNerfs: number;
  itemAdjusts: number;
  arenaBuffs: number;
  arenaNerfs: number;
  arenaAdjusts: number;
}

// 확장된 패치노트
export interface PatchNoteExtended extends PatchNote {
  arena?: ArenaChanges;
  aram?: AramChanges;
  metaPredictions?: MetaPrediction[];
  summary?: PatchSummary;
}
