"use client";

import { usePatchNote } from "@/hooks/usePatchNotes";
import ChampionChanges from "./ChampionChanges";
import ItemChanges from "./ItemChanges";
import SystemChanges from "./SystemChanges";

interface PatchContentProps {
  version: string | null;
}

export default function PatchContent({ version }: PatchContentProps) {
  const { data: patchNote, isLoading, error } = usePatchNote(version || "");

  if (!version) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">
          좌측에서 패치 버전을 선택해주세요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* 헤더 스켈레톤 */}
        <div className="bg-surface-1 rounded-lg border border-divider/50 p-6">
          <div className="h-8 w-48 bg-surface-4 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-surface-4 rounded animate-pulse" />
        </div>

        {/* 섹션 스켈레톤 */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-surface-1 rounded-lg border border-divider/50 p-4"
          >
            <div className="h-6 w-40 bg-surface-4 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[...Array(3)].map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="h-16 bg-surface-2 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">
          패치노트를 불러오는데 실패했습니다.
        </p>
      </div>
    );
  }

  if (!patchNote) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">패치노트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasContent =
    patchNote.champions.length > 0 ||
    patchNote.items.length > 0 ||
    patchNote.systems.length > 0;

  return (
    <div className="space-y-4">
      {/* 패치 헤더 */}
      <div className="bg-surface-1 rounded-lg border border-divider/50 p-6">
        <h2 className="text-2xl font-bold text-on-surface mb-1">
          패치 {patchNote.version}
        </h2>
        <p className="text-on-surface-medium">
          {formatDate(patchNote.releaseDate)}
        </p>
      </div>

      {/* 변경사항 섹션들 */}
      {hasContent ? (
        <>
          <ChampionChanges changes={patchNote.champions} />
          <ItemChanges changes={patchNote.items} />
          <SystemChanges changes={patchNote.systems} />
        </>
      ) : (
        <div className="flex items-center justify-center h-32 bg-surface-1 rounded-lg border border-divider/50">
          <p className="text-on-surface-medium">변경사항이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
