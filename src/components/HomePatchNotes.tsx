"use client";

import { usePatchVersions } from "@/hooks/usePatchNotes";
import Link from "next/link";

export default function HomePatchNotes() {
  const { data: patches, isLoading, error } = usePatchVersions();

  return (
    <div>
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-2">패치노트</h2>
        <p className="text-on-surface-medium text-sm">
          최신 패치노트를 확인하세요
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-12 bg-surface-2 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-surface-2 rounded-lg border border-divider/50">
          <p className="text-on-surface-medium text-sm">
            패치노트를 불러오는데 실패했습니다.
          </p>
        </div>
      ) : !patches || patches.length === 0 ? (
        <div className="p-4 bg-surface-2 rounded-lg border border-divider/50">
          <p className="text-on-surface-medium text-sm">
            패치노트가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {patches.map((patch) => (
            <Link
              key={patch.versionId}
              href={`/patch-notes?version=${patch.versionId}`}
              className="block w-full text-left p-3 rounded-lg bg-surface-2 hover:bg-surface-4 border-l-4 border-transparent hover:border-primary transition-all"
            >
              <span className="font-bold text-lg text-on-surface">
                {patch.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
