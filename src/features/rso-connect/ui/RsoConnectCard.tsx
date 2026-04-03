"use client";

import { useState } from "react";
import { useRsoConnect } from "../model/useRsoConnect";

export default function RsoConnectCard() {
  const {
    riotAccounts,
    isLoading,
    isLinked,
    initiateRsoConnect,
    disconnectRiotAccount,
    isDisconnecting,
  } = useRsoConnect();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="px-5 py-6 bg-surface-1 border border-divider rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-4 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 bg-surface-4 rounded animate-pulse" />
            <div className="w-48 h-3 bg-surface-4 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 bg-surface-1 border border-divider rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Riot Games 아이콘 */}
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
            <h3 className="text-sm font-bold text-on-surface">
              Riot 계정 (RSO)
            </h3>
            {!isLinked && (
              <p className="text-xs text-on-surface-disabled mt-0.5">
                라이엇 계정을 연동하여 전적 검색에 활용할 수 있습니다.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={initiateRsoConnect}
            className="px-4 py-2 text-sm font-medium text-on-surface bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            연동하기
          </button>
        </div>
      </div>

      {isLinked && (
        <div className="space-y-2 mt-3">
          {riotAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-lg"
            >
              <p className="text-sm text-on-surface">
                {account.gameName}#{account.tagLine}{" "}
                <span className="text-on-surface-medium">
                  ({account.platformId})
                </span>
              </p>
              {confirmId !== account.id ? (
                <button
                  type="button"
                  onClick={() => setConfirmId(account.id)}
                  className="px-3 py-1.5 text-xs text-on-surface-medium border border-divider rounded-lg hover:text-error hover:border-error transition-colors"
                >
                  해제
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      disconnectRiotAccount(account.id, {
                        onSuccess: () => setConfirmId(null),
                      });
                    }}
                    disabled={isDisconnecting}
                    className="px-3 py-1.5 text-xs text-error border border-error rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    {isDisconnecting ? "해제 중..." : "확인"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    disabled={isDisconnecting}
                    className="px-3 py-1.5 text-xs text-on-surface-medium border border-divider rounded-lg hover:bg-surface-2 transition-colors disabled:opacity-50"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
