"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRiotLink } from "../model/useRiotLink";

export default function RiotLinkCard() {
  const t = useTranslations("mypage.riotLink");
  const tCommon = useTranslations("common");
  const {
    riotAccounts,
    isLinked,
    initiateLink,
    disconnectAll,
    isDisconnecting,
    confirming,
    setConfirming,
  } = useRiotLink();

  const nicknames = riotAccounts.map((a) => a.nickname).join(", ");

  return (
    <div className="flex items-center justify-between px-5 py-4 bg-surface-1 border border-divider rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#D32936] rounded-lg flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3.527 7.795l2.69 15.205L18.82 24l1.653-2.534-7.199-1.57V8.617l4.936 1.078v8.576l3.733.814L24 15.745V3.087L3.527 7.795zM0 9.384l2.022 11.452L3.48 21.1V8.469L0 9.384z" />
          </svg>
        </div>
        <div>
          <span className="text-sm font-medium text-on-surface">
            Riot Games
          </span>
          {!isLinked && (
            <p className="text-xs text-on-surface-disabled mt-0.5">
              {t("description")}
            </p>
          )}
          {isLinked && (
            <p className="text-xs text-on-surface-medium mt-0.5">
              {nicknames}
            </p>
          )}
        </div>
      </div>

      {!isLinked && (
        <button
          type="button"
          onClick={initiateLink}
          className="shrink-0 px-4 py-2 text-sm font-medium text-on-surface bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t("link")}
        </button>
      )}

      {isLinked && !confirming && (
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="w-4 h-4" />
            {t("linked")}
          </span>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="px-3 py-1.5 text-xs text-on-surface-medium border border-divider rounded-lg hover:text-error hover:border-error transition-colors"
          >
            {t("unlink")}
          </button>
        </div>
      )}

      {isLinked && confirming && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => disconnectAll()}
            disabled={isDisconnecting}
            className="px-3 py-1.5 text-xs text-error border border-error rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50"
          >
            {isDisconnecting ? t("unlinking") : tCommon("confirm")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isDisconnecting}
            className="px-3 py-1.5 text-xs text-on-surface-medium border border-divider rounded-lg hover:bg-surface-4 transition-colors disabled:opacity-50"
          >
            {tCommon("cancel")}
          </button>
        </div>
      )}
    </div>
  );
}
