// 변경 유형
export type ChangeType =
  | "buff"
  | "nerf"
  | "adjust"
  | "new"
  | "rework"
  | "bugfix";

export interface PatchVersion {
  version: string;
  releaseDate: string;
  highlights: string[];
}

export interface PatchVersionListItem {
  versionId: string;
  title: string;
}

export interface ChampionChange {
  championKey: string;
  championName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface ItemChange {
  itemId: number;
  itemName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface SystemChange {
  category: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface ChangeDetail {
  attribute: string;
  before: string;
  after: string;
}

export interface EpicObjectiveChange {
  objectiveName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface CommonChanges {
  champions: ChampionChange[];
  items: ItemChange[];
  epicObjectives: EpicObjectiveChange[];
}

export interface PatchNote {
  version: string;
  releaseDate: string;
  common: CommonChanges;
  systems: SystemChange[];
}

export interface PatchVersionsResponse {
  content: PatchVersion[];
  hasNext: boolean;
}

export interface PatchNoteResponse {
  version: string;
  releaseDate: string;
  common: CommonChanges;
  systems: SystemChange[];
}

export interface PatchNoteDetailResponse {
  versionId: string;
  title: string;
  content: RawPatchNote;
  patchUrl?: string;
  createdAt?: string;
}

export interface ArenaChampionChange {
  championKey: string;
  championName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface ArenaSystemChange {
  category: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface ArenaChanges {
  champions: ArenaChampionChange[];
  systems: ArenaSystemChange[];
}

export interface AramChampionChange {
  championKey: string;
  championName: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface AramSystemChange {
  category: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export interface AramChanges {
  champions: AramChampionChange[];
  systems: AramSystemChange[];
}

export interface MetaPrediction {
  category: string;
  predictions: string[];
}

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

export interface PatchNoteExtended extends PatchNote {
  arena?: ArenaChanges;
  aram?: AramChanges;
  metaPredictions?: MetaPrediction[];
  summary?: PatchSummary;
  patchUrl?: string;
  createdAt?: string;
}

// Raw types (from patchRaw.ts)
export interface RawChangeDetail {
  statName: string;
  before: string;
  after: string;
}

export interface RawChange {
  targetName: string;
  type: "champion" | "item" | "system" | "augment";
  direction: "buff" | "nerf" | "adjust";
  changes: RawChangeDetail[];
}

export interface RawGameModeChanges {
  champions: RawChange[] | null;
  items: RawChange[] | null;
  systems: RawChange[] | null;
}

export interface RawAramChanges {
  champions: RawChange[] | null;
  augments: RawChange[] | null;
  items: RawChange[] | null;
}

export interface RawPatchNote {
  version: string;
  rift: RawGameModeChanges;
  arena: RawGameModeChanges;
  aram?: RawAramChanges;
}
