"use client";

import {
  useConfirmDuoRequest,
  useCancelDuoRequest,
} from "@/entities/duo";
import type { RequestStatus } from "@/entities/duo";

interface RequesterActionButtonsProps {
  requestId: number;
  status: RequestStatus;
}

export default function RequesterActionButtons({
  requestId,
  status,
}: RequesterActionButtonsProps) {
  const confirm = useConfirmDuoRequest();
  const cancel = useCancelDuoRequest();

  const isPending = confirm.isPending || cancel.isPending;

  return (
    <div className="flex gap-2">
      {status === "ACCEPTED" && (
        <button
          type="button"
          onClick={() => confirm.mutate(requestId)}
          disabled={isPending}
          className="cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md bg-primary hover:bg-primary/80 text-on-primary transition-colors disabled:opacity-50"
        >
          {confirm.isPending ? "확정 중..." : "확정하기"}
        </button>
      )}
      {(status === "PENDING" || status === "ACCEPTED") && (
        <button
          type="button"
          onClick={() => cancel.mutate(requestId)}
          disabled={isPending}
          className="cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50"
        >
          {cancel.isPending ? "취소 중..." : "취소"}
        </button>
      )}
    </div>
  );
}
