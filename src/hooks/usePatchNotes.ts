import { getPatchNote, getPatchVersions } from "@/lib/api/patchnotes";
import { transformPatchNote, type PatchNoteMetadata } from "@/lib/transforms/patchnotes";
import { useGameDataStore } from "@/stores/useGameDataStore";
import type { PatchNoteExtended, PatchVersionListItem } from "@/types/patchnotes";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

/**
 * 패치 버전 목록 조회 훅
 */
export function usePatchVersions() {
  return useQuery<PatchVersionListItem[], Error>({
    queryKey: ["patchnotes", "versions"],
    queryFn: getPatchVersions,
    staleTime: 30 * 60 * 1000, // 30분간 캐시 유지 (패치노트는 자주 변경되지 않음)
  });
}

/**
 * 패치노트 조회를 위한 공통 queryFn
 */
async function fetchPatchNote(versionId: string): Promise<PatchNoteExtended> {
  const { championData, loadChampionData } = useGameDataStore.getState();

  // 1. 챔피언 데이터 로드 (없으면 로드)
  let champData = championData;
  if (!champData) {
    await loadChampionData();
    champData = useGameDataStore.getState().championData;
  }

  if (!champData) {
    throw new Error("챔피언 데이터를 로드할 수 없습니다.");
  }

  // 2. API에서 패치노트 조회
  const response = await getPatchNote(versionId);

  // 3. 메타데이터 추출
  const metadata: PatchNoteMetadata = {
    patchUrl: response.patchUrl,
    createdAt: response.createdAt,
  };

  // 4. 변환하여 반환
  return transformPatchNote(response.content, champData, metadata);
}

/**
 * 특정 패치노트 상세 조회 훅
 * @param versionId 패치 버전 ID (예: "26.S1.1")
 */
export function usePatchNote(versionId: string) {
  return useQuery<PatchNoteExtended, Error>({
    queryKey: ["patchnotes", "detail", versionId],
    queryFn: () => fetchPatchNote(versionId),
    enabled: !!versionId,
    staleTime: 60 * 60 * 1000, // 1시간 캐시 유지 (패치노트는 변경되지 않음)
  });
}

/**
 * 특정 패치노트 상세 조회 훅 (Suspense 버전)
 * @param versionId 패치 버전 ID (예: "26.S1.1")
 */
export function useSuspensePatchNote(versionId: string) {
  return useSuspenseQuery<PatchNoteExtended, Error>({
    queryKey: ["patchnotes", "detail", versionId],
    queryFn: () => fetchPatchNote(versionId),
    staleTime: 60 * 60 * 1000, // 1시간 캐시 유지 (패치노트는 변경되지 않음)
  });
}
