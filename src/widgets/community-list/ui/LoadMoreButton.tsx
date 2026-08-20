"use client";

import { useTranslations } from "next-intl";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

/** 다음 페이지 버튼. 목록과 상세 하단 목록이 함께 쓴다. */
export default function LoadMoreButton({
  onClick,
  isLoading,
}: Readonly<LoadMoreButtonProps>) {
  const t = useTranslations("community");

  return (
    <div className="pt-1 pb-4 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="px-6 py-2 bg-surface-1 hover:bg-surface-4 border border-divider rounded-lg text-sm font-medium text-on-surface-medium transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? t("loading") : t("loadMore")}
      </button>
    </div>
  );
}
