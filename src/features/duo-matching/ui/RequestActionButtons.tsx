"use client";

import { useAcceptDuoRequest, useRejectDuoRequest } from "@/entities/duo";
import type { RequestStatus } from "@/entities/duo";
import { useTranslations } from "next-intl";

interface RequestActionButtonsProps {
  requestId: number;
  status: RequestStatus;
}

export default function RequestActionButtons({
  requestId,
  status,
}: RequestActionButtonsProps) {
  const t = useTranslations("duo.actions");
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
        className="cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
      >
        {accept.isPending ? t("accepting") : t("accept")}
      </button>
      <button
        type="button"
        onClick={() => reject.mutate(requestId)}
        disabled={isPending}
        className="cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md bg-surface-4 border border-divider text-on-surface-medium hover:bg-surface-8 transition-colors disabled:opacity-50"
      >
        {reject.isPending ? t("rejecting") : t("reject")}
      </button>
    </div>
  );
}
