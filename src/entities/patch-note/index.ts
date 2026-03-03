export { getPatchVersions, getPatchNote } from "./api/patchnotesApi";
export { transformPatchNote, clearChampionNameCache } from "./lib/transformPatchNote";
export type { PatchNoteMetadata } from "./lib/transformPatchNote";
// fetchPatchNoteServer는 서버 전용 (fs 사용). 직접 import: "@/entities/patch-note/lib/serverPatchnotes"
export { usePatchVersions, usePatchNote, useSuspensePatchNote } from "./model/usePatchNotes";
export type {
  ChangeType, PatchVersion, PatchVersionListItem,
  ChampionChange, ItemChange, SystemChange, ChangeDetail,
  EpicObjectiveChange, CommonChanges, PatchNote,
  PatchVersionsResponse, PatchNoteResponse, PatchNoteDetailResponse,
  ArenaChampionChange, ArenaSystemChange, ArenaChanges,
  AramChampionChange, AramSystemChange, AramChanges,
  MetaPrediction, PatchSummary, PatchNoteExtended,
  RawChangeDetail, RawChange, RawGameModeChanges, RawAramChanges, RawPatchNote,
} from "./types";
