import { getPatchNote, getPatchVersions } from "@/lib/api/patchnotes";
import { mockPatchNote262, mockPatchVersions } from "@/lib/mocks/patchNoteMock";
import type { PatchNoteExtended, PatchVersion } from "@/types/patchnotes";
import { useQuery } from "@tanstack/react-query";

// 개발 모드에서 더미데이터 사용 여부 (true로 설정하면 mock 데이터 사용)
const USE_MOCK_DATA = process.env.NODE_ENV === "development" && true;

/**
 * 패치 버전 목록 조회 훅
 * @param page 페이지 번호 (0부터 시작)
 */
export function usePatchVersions(page: number = 0) {
  return useQuery<PatchVersion[], Error>({
    queryKey: ["patchnotes", "versions", page],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // 개발 모드: 더미데이터 반환
        return mockPatchVersions;
      }
      return getPatchVersions(page);
    },
    staleTime: 30 * 60 * 1000, // 30분간 캐시 유지 (패치노트는 자주 변경되지 않음)
  });
}

/**
 * 특정 패치노트 상세 조회 훅
 * @param version 패치 버전 (예: "25.2")
 */
export function usePatchNote(version: string) {
  return useQuery<PatchNoteExtended, Error>({
    queryKey: ["patchnotes", "detail", version],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // 개발 모드: 더미데이터 반환
        if (version === "26.2") {
          return mockPatchNote262;
        }
        // 다른 버전은 API 호출
        return getPatchNote(version) as Promise<PatchNoteExtended>;
      }
      return getPatchNote(version) as Promise<PatchNoteExtended>;
    },
    enabled: !!version,
    staleTime: 60 * 60 * 1000, // 1시간 캐시 유지 (패치노트는 변경되지 않음)
  });
}
