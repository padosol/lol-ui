"use client";

import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemberWithdrawal } from "../model/useMemberWithdrawal";

interface WithdrawalConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WithdrawalConfirmModal({
  open,
  onClose,
}: WithdrawalConfirmModalProps) {
  const t = useTranslations("mypage.withdrawModal");
  const tCommon = useTranslations("common");
  const { withdraw, isPending, error } = useMemberWithdrawal();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || isPending) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isPending, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={(e) => {
        if (!isPending && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-4 rounded-lg border border-divider w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-on-surface">{t("title")}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-on-surface-disabled hover:text-on-surface transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-on-surface mb-1">
              {t("confirmQuestion")}
            </p>
            <p className="text-xs text-on-surface-medium leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-error mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 bg-surface-4 border border-divider text-on-surface-medium rounded-lg text-sm font-medium hover:bg-surface-1 transition-colors disabled:opacity-50"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={() => withdraw()}
            disabled={isPending}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? tCommon("processing") : t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
