// 패치노트 JSON → 컴포넌트 타입 변환 유틸리티

import type { ChampionJson } from "@/stores/useGameDataStore";
import type {
  AramChanges,
  AramChampionChange,
  AramSystemChange,
  ArenaChanges,
  ArenaChampionChange,
  ArenaSystemChange,
  ChangeDetail,
  ChangeType,
  ChampionChange,
  ItemChange,
  PatchNoteExtended,
  PatchSummary,
  SystemChange,
} from "@/types/patchnotes";
import type {
  RawAramChanges,
  RawChange,
  RawChangeDetail,
  RawGameModeChanges,
  RawPatchNote,
} from "@/types/patchRaw";

// 패치노트 메타데이터 (API 응답에서 추출)
export interface PatchNoteMetadata {
  patchUrl?: string;
  createdAt?: string;
}

// 한글 챔피언 이름 → 영문 ID 매핑 캐시
let championNameToKeyCache: Map<string, string> | null = null;

/**
 * 챔피언 데이터에서 한글 이름 → 영문 ID 매핑 생성
 */
function buildChampionNameToKeyMap(championData: ChampionJson): Map<string, string> {
  if (championNameToKeyCache) {
    return championNameToKeyCache;
  }

  const map = new Map<string, string>();
  for (const key of Object.keys(championData.data)) {
    const champion = championData.data[key];
    // 한글 이름 → 영문 id 매핑
    map.set(champion.name, champion.id);
  }

  championNameToKeyCache = map;
  return map;
}

/**
 * 한글 챔피언 이름에서 영문 키 찾기
 */
function findChampionKey(koreanName: string, championData: ChampionJson): string {
  const nameToKeyMap = buildChampionNameToKeyMap(championData);
  return nameToKeyMap.get(koreanName) || koreanName;
}

/**
 * 변경사항 배열에서 요약 텍스트 자동 생성
 */
function generateSummary(changes: RawChangeDetail[]): string {
  if (changes.length === 0) return "";

  // 첫 번째 변경사항을 기반으로 요약 생성
  const firstChange = changes[0];
  const { statName, before, after } = firstChange;

  // 신규/삭제 패턴 감지
  if (before === "-") {
    return `${statName} 추가`;
  }
  if (after === "삭제" || after === "비활성화") {
    return `${statName} 삭제`;
  }

  // 일반적인 변경 패턴
  return `${statName} 변경`;
}

/**
 * Raw 변경 상세 → ChangeDetail 변환
 */
function transformChangeDetail(raw: RawChangeDetail): ChangeDetail {
  return {
    attribute: raw.statName,
    before: raw.before,
    after: raw.after,
  };
}

/**
 * Raw 챔피언 변경 → ChampionChange 변환
 */
function transformChampion(raw: RawChange, championData: ChampionJson): ChampionChange {
  return {
    championKey: findChampionKey(raw.targetName, championData),
    championName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * Raw 아이템 변경 → ItemChange 변환
 */
function transformItem(raw: RawChange): ItemChange {
  return {
    itemId: 0, // 아이템 ID 매핑은 추후 구현 가능
    itemName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * Raw 시스템 변경 → SystemChange 변환
 */
function transformSystem(raw: RawChange): SystemChange {
  return {
    category: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * Raw 아레나 챔피언 변경 → ArenaChampionChange 변환
 */
function transformArenaChampion(raw: RawChange, championData: ChampionJson): ArenaChampionChange {
  return {
    championKey: findChampionKey(raw.targetName, championData),
    championName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * Raw 아레나 시스템 변경 → ArenaSystemChange 변환
 */
function transformArenaSystem(raw: RawChange): ArenaSystemChange {
  return {
    category: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * Raw ARAM 챔피언 변경 → AramChampionChange 변환
 */
function transformAramChampion(raw: RawChange, championData: ChampionJson): AramChampionChange {
  return {
    championKey: findChampionKey(raw.targetName, championData),
    championName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * Raw ARAM 시스템 변경 → AramSystemChange 변환
 */
function transformAramSystem(raw: RawChange): AramSystemChange {
  return {
    category: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

/**
 * 협곡(Rift) 변경사항 변환
 */
function transformRiftChanges(
  rift: RawGameModeChanges,
  championData: ChampionJson
): {
  champions: ChampionChange[];
  items: ItemChange[];
  systems: SystemChange[];
} {
  return {
    champions: (rift.champions ?? []).map((c) => transformChampion(c, championData)),
    items: (rift.items ?? []).map(transformItem),
    systems: (rift.systems ?? []).map(transformSystem),
  };
}

/**
 * 아레나 변경사항 변환
 */
function transformArenaChanges(
  arena: RawGameModeChanges,
  championData: ChampionJson
): ArenaChanges {
  // arena.systems에는 system과 augment가 섞여 있을 수 있음
  const allSystems = (arena.systems ?? []).map(transformArenaSystem);

  return {
    champions: (arena.champions ?? []).map((c) => transformArenaChampion(c, championData)),
    systems: allSystems,
  };
}

/**
 * ARAM 변경사항 변환
 */
function transformAramChanges(aram: RawAramChanges, championData: ChampionJson): AramChanges {
  // augments를 systems로 변환
  const augmentSystems = (aram.augments ?? []).map(transformAramSystem);
  // items도 systems 형태로 변환할 수 있지만, 여기서는 별도로 처리
  const itemSystems = (aram.items ?? []).map(transformAramSystem);

  return {
    champions: (aram.champions ?? []).map((c) => transformAramChampion(c, championData)),
    systems: [...augmentSystems, ...itemSystems],
  };
}

/**
 * 패치 요약 통계 계산
 */
function calculateSummary(
  raw: RawPatchNote,
  arena?: ArenaChanges,
  _aram?: AramChanges
): PatchSummary {
  const countByDirection = (changes: RawChange[] | null | undefined, direction: string) =>
    (changes ?? []).filter((c) => c.direction === direction).length;

  return {
    championBuffs: countByDirection(raw.rift?.champions, "buff"),
    championNerfs: countByDirection(raw.rift?.champions, "nerf"),
    championAdjusts: countByDirection(raw.rift?.champions, "adjust"),
    itemBuffs: countByDirection(raw.rift?.items, "buff"),
    itemNerfs: countByDirection(raw.rift?.items, "nerf"),
    itemAdjusts: countByDirection(raw.rift?.items, "adjust"),
    arenaBuffs: arena?.champions.filter((c) => c.changeType === "buff").length || 0,
    arenaNerfs: arena?.champions.filter((c) => c.changeType === "nerf").length || 0,
    arenaAdjusts: arena?.champions.filter((c) => c.changeType === "adjust").length || 0,
  };
}

/**
 * 메인 변환 함수: RawPatchNote → PatchNoteExtended
 */
export function transformPatchNote(
  raw: RawPatchNote,
  championData: ChampionJson,
  metadata?: PatchNoteMetadata
): PatchNoteExtended {
  const riftChanges = transformRiftChanges(raw.rift, championData);
  const arenaChanges = transformArenaChanges(raw.arena, championData);
  const aramChanges = raw.aram ? transformAramChanges(raw.aram, championData) : undefined;

  const summary = calculateSummary(raw, arenaChanges, aramChanges);

  return {
    version: raw.version,
    releaseDate: metadata?.createdAt || "",
    common: {
      champions: riftChanges.champions,
      items: riftChanges.items,
      epicObjectives: [], // JSON에 없음
    },
    systems: riftChanges.systems,
    arena: arenaChanges,
    aram: aramChanges,
    summary,
    patchUrl: metadata?.patchUrl,
    createdAt: metadata?.createdAt,
  };
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearChampionNameCache(): void {
  championNameToKeyCache = null;
}
