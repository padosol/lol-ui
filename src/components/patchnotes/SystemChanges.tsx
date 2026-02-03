"use client";

import type { SystemChange } from "@/types/patchnotes";
import { ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import ChangeBadge from "./ChangeBadge";

interface SystemChangesProps {
  changes: SystemChange[];
}

export default function SystemChanges({ changes }: SystemChangesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (changes.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
      {/* 섹션 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-on-surface">
            시스템 변경사항
          </span>
          <span className="text-sm text-on-surface-medium px-2 py-0.5 rounded-full bg-surface-4">
            {changes.length}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-on-surface-medium transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 내용 */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-2">
          {changes.map((change, index) => (
            <div
              key={index}
              id={`system-${change.category.replace(/\s+/g, "-")}`}
              className="bg-surface-2 rounded-lg border border-divider/50 overflow-hidden scroll-mt-48"
            >
              {/* 헤더 */}
              <div className="flex items-center gap-3 p-3">
                {/* 아이콘 */}
                <div className="w-10 h-10 rounded-lg bg-surface-4 border border-divider/50 shrink-0 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-on-surface-medium" />
                </div>

                {/* 카테고리 + 배지 */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-medium text-on-surface truncate">
                    {change.category}
                  </span>
                  <ChangeBadge type={change.changeType} />
                </div>
              </div>

              {/* 상세 내용 - 항상 펼쳐진 상태 */}
              <div className="px-4 pb-4 pt-2 border-t border-divider/50">
                {/* 변경 상세 */}
                {change.details.length > 0 && (
                  <div className="space-y-2">
                    {change.details.map((detail, detailIndex) => (
                      <div
                        key={detailIndex}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm"
                      >
                        <span className="text-on-surface-medium font-medium min-w-[120px]">
                          {detail.attribute}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-loss line-through">
                            {detail.before}
                          </span>
                          <span className="text-on-surface-disabled">→</span>
                          <span className="text-win font-medium">
                            {detail.after}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {change.details.length === 0 && (
                  <p className="text-sm text-on-surface-medium">
                    {change.summary}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
