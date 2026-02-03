// 패치노트 JSON 파일의 원본(Raw) 구조 타입 정의

// 변경 상세 내용 (원본)
export interface RawChangeDetail {
  statName: string;
  before: string;
  after: string;
}

// 변경사항 (원본)
export interface RawChange {
  targetName: string;
  type: "champion" | "item" | "system" | "augment";
  direction: "buff" | "nerf" | "adjust";
  changes: RawChangeDetail[];
}

// 게임 모드 변경사항 (협곡, 아레나)
export interface RawGameModeChanges {
  champions: RawChange[] | null;
  items: RawChange[] | null;
  systems: RawChange[] | null;
}

// ARAM 변경사항
export interface RawAramChanges {
  champions: RawChange[] | null;
  augments: RawChange[] | null;
  items: RawChange[] | null;
}

// 패치노트 JSON 파일 전체 구조
export interface RawPatchNote {
  version: string;
  rift: RawGameModeChanges;
  arena: RawGameModeChanges;
  aram?: RawAramChanges;
}
