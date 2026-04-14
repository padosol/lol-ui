"use client";

import { useAcceptDuoRequest, useRejectDuoRequest } from "@/entities/duo";
import type { RequestStatus } from "@/entities/duo";

interface RequestActionButtonsProps {
  requestId: number;
  status: RequestStatus;
}

export default function RequestActionButtons({
  requestId,
  status,
}: RequestActionButtonsProps) {
  const accept = useAcceptDuoRequest();
  const reject = useRejectDuoRequest();

  if (status !== "PENDING") return null;

  const isPending = accept.isPending || reject.isPending;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => accept.mutate(requestId)}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
      >
        {accept.isPending ? "수락 중..." : "수락"}
      </button>
      <button
        type="button"
        onClick={() => reject.mutate(requestId)}
        disabled={isPending}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50"
      >
        {reject.isPending ? "거절 중..." : "거절"}
      </button>
    </div>
  );
}
