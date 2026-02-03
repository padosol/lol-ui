"use client";

import { Suspense } from "react";
import PatchContentInner from "./PatchContentInner";
import PatchContentSkeleton from "./skeleton/PatchContentSkeleton";

interface PatchContentProps {
  version: string | null;
}

export default function PatchContent({ version }: PatchContentProps) {
  if (!version) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-1 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium">
          좌측에서 패치 버전을 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PatchContentSkeleton />}>
      <PatchContentInner version={version} />
    </Suspense>
  );
}
