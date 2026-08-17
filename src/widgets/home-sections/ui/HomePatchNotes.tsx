"use client";

import { usePatchVersions } from "@/entities/patch-note";
import { Link } from "@/shared/i18n/navigation";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

// 라이트에서 surface-2 는 카드(surface-1) 와 거의 같은 흰색이라 면만으로는 구분되지 않는다.
// divider 테두리로 항목 경계를 만들고, 왼쪽 4px 만 hover 시 강조색으로 바꾼다.
const ITEM_CLASS =
  "flex items-center justify-between gap-2 w-full text-left px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-divider border-l-4 border-l-transparent hover:border-l-primary transition-all";

export default function HomePatchNotes() {
  const t = useTranslations("home.patchNotes");
  const { data: patches, isLoading, error } = usePatchVersions();

  return (
    <div className="bg-surface-1 border border-divider rounded-xl p-6">
      <div className="text-left mb-4">
        <h2 className="text-lg font-bold text-on-surface mb-1">{t("title")}</h2>
        <p className="text-on-surface-medium text-xs">{t("subtitle")}</p>
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
        <div className="p-4 bg-surface-2 rounded-lg border border-divider">
          <p className="text-on-surface-medium text-sm">{t("error")}</p>
        </div>
      ) : !patches || patches.length === 0 ? (
        <div className="p-4 bg-surface-2 rounded-lg border border-divider">
          <p className="text-on-surface-medium text-sm">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patches.map((patch) =>
            patch.patchUrl ? (
              <a
                key={patch.versionId}
                href={patch.patchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={ITEM_CLASS}
              >
                <span className="font-bold text-sm text-on-surface">
                  {patch.title}
                </span>
                <ExternalLink className="w-4 h-4 shrink-0 text-on-surface-medium" />
              </a>
            ) : (
              <Link
                key={patch.versionId}
                href={`/patch-notes/${patch.versionId}`}
                className={ITEM_CLASS}
              >
                <span className="font-bold text-sm text-on-surface">
                  {patch.title}
                </span>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
