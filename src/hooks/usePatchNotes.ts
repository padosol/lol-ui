import { getPatchNote, getPatchVersions } from "@/lib/api/patchnotes";
import type { PatchNote, PatchVersion } from "@/types/patchnotes";
import { useQuery } from "@tanstack/react-query";

/**
 * 패치 버전 목록 조회 훅
 * @param page 페이지 번호 (0부터 시작)
 */
export function usePatchVersions(page: number = 0) {
  return useQuery<PatchVersion[], Error>({
    queryKey: ["patchnotes", "versions", page],
    queryFn: () => getPatchVersions(page),
    staleTime: 30 * 60 * 1000, // 30분간 캐시 유지 (패치노트는 자주 변경되지 않음)
  });
}

/**
 * 특정 패치노트 상세 조회 훅
 * @param version 패치 버전 (예: "25.2")
 */
export function usePatchNote(version: string) {
  return useQuery<PatchNote, Error>({
    queryKey: ["patchnotes", "detail", version],
    queryFn: () => getPatchNote(version),
    enabled: !!version,
    staleTime: 60 * 60 * 1000, // 1시간 캐시 유지 (패치노트는 변경되지 않음)
  });
}
