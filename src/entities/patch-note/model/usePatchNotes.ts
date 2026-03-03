import { getPatchNote, getPatchVersions } from "../api/patchnotesApi";
import { transformPatchNote, type PatchNoteMetadata } from "../lib/transformPatchNote";
import { useGameDataStore } from "@/shared/model/game-data";
import type { PatchNoteExtended, PatchVersionListItem } from "../types";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export function usePatchVersions() {
  return useQuery<PatchVersionListItem[], Error>({
    queryKey: ["patchnotes", "versions"],
    queryFn: getPatchVersions,
    staleTime: 30 * 60 * 1000,
  });
}

async function fetchPatchNote(versionId: string): Promise<PatchNoteExtended> {
  const { championData, loadChampionData } = useGameDataStore.getState();
  let champData = championData;
  if (!champData) {
    await loadChampionData();
    champData = useGameDataStore.getState().championData;
  }
  if (!champData) throw new Error("챔피언 데이터를 로드할 수 없습니다.");
  const response = await getPatchNote(versionId);
  const metadata: PatchNoteMetadata = { patchUrl: response.patchUrl, createdAt: response.createdAt };
  return transformPatchNote(response.content, champData, metadata);
}

export function usePatchNote(versionId: string) {
  return useQuery<PatchNoteExtended, Error>({
    queryKey: ["patchnotes", "detail", versionId],
    queryFn: () => fetchPatchNote(versionId),
    enabled: !!versionId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSuspensePatchNote(versionId: string) {
  return useSuspenseQuery<PatchNoteExtended, Error>({
    queryKey: ["patchnotes", "detail", versionId],
    queryFn: () => fetchPatchNote(versionId),
    staleTime: 60 * 60 * 1000,
  });
}
