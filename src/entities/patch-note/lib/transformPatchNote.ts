import type { ChampionJson } from "@/shared/model/game-data";
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
  RawAramChanges,
  RawChange,
  RawChangeDetail,
  RawGameModeChanges,
  RawPatchNote,
} from "../types";

export interface PatchNoteMetadata {
  patchUrl?: string;
  createdAt?: string;
}

let championNameToKeyCache: Map<string, string> | null = null;

function buildChampionNameToKeyMap(championData: ChampionJson): Map<string, string> {
  if (championNameToKeyCache) {
    return championNameToKeyCache;
  }

  const map = new Map<string, string>();
  for (const key of Object.keys(championData.data)) {
    const champion = championData.data[key];
    map.set(champion.name, champion.id);
  }

  championNameToKeyCache = map;
  return map;
}

function findChampionKey(koreanName: string, championData: ChampionJson): string {
  const nameToKeyMap = buildChampionNameToKeyMap(championData);
  return nameToKeyMap.get(koreanName) || koreanName;
}

function generateSummary(changes: RawChangeDetail[]): string {
  if (changes.length === 0) return "";

  const firstChange = changes[0];
  const { statName, before, after } = firstChange;

  if (before === "-") {
    return `${statName} 추가`;
  }
  if (after === "삭제" || after === "비활성화") {
    return `${statName} 삭제`;
  }

  return `${statName} 변경`;
}

function transformChangeDetail(raw: RawChangeDetail): ChangeDetail {
  return {
    attribute: raw.statName,
    before: raw.before,
    after: raw.after,
  };
}

function transformChampion(raw: RawChange, championData: ChampionJson): ChampionChange {
  return {
    championKey: findChampionKey(raw.targetName, championData),
    championName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

function transformItem(raw: RawChange): ItemChange {
  return {
    itemId: 0,
    itemName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

function transformSystem(raw: RawChange): SystemChange {
  return {
    category: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

function transformArenaChampion(raw: RawChange, championData: ChampionJson): ArenaChampionChange {
  return {
    championKey: findChampionKey(raw.targetName, championData),
    championName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

function transformArenaSystem(raw: RawChange): ArenaSystemChange {
  return {
    category: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

function transformAramChampion(raw: RawChange, championData: ChampionJson): AramChampionChange {
  return {
    championKey: findChampionKey(raw.targetName, championData),
    championName: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

function transformAramSystem(raw: RawChange): AramSystemChange {
  return {
    category: raw.targetName,
    changeType: raw.direction as ChangeType,
    summary: generateSummary(raw.changes),
    details: raw.changes.map(transformChangeDetail),
  };
}

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

function transformArenaChanges(
  arena: RawGameModeChanges,
  championData: ChampionJson
): ArenaChanges {
  const allSystems = (arena.systems ?? []).map(transformArenaSystem);

  return {
    champions: (arena.champions ?? []).map((c) => transformArenaChampion(c, championData)),
    systems: allSystems,
  };
}

function transformAramChanges(aram: RawAramChanges, championData: ChampionJson): AramChanges {
  const augmentSystems = (aram.augments ?? []).map(transformAramSystem);
  const itemSystems = (aram.items ?? []).map(transformAramSystem);

  return {
    champions: (aram.champions ?? []).map((c) => transformAramChampion(c, championData)),
    systems: [...augmentSystems, ...itemSystems],
  };
}

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
      epicObjectives: [],
    },
    systems: riftChanges.systems,
    arena: arenaChanges,
    aram: aramChanges,
    summary,
    patchUrl: metadata?.patchUrl,
    createdAt: metadata?.createdAt,
  };
}

export function clearChampionNameCache(): void {
  championNameToKeyCache = null;
}
