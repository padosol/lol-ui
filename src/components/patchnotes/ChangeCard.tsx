"use client";

import type { ChangeDetail, ChangeType } from "@/types/patchnotes";
import Image from "next/image";
import ChangeBadge from "./ChangeBadge";

interface ChangeCardProps {
  id?: string;
  name: string;
  imageUrl?: string;
  changeType: ChangeType;
  summary: string;
  details: ChangeDetail[];
}

export default function ChangeCard({
  id,
  name,
  imageUrl,
  changeType,
  summary,
  details,
}: ChangeCardProps) {
  return (
    <div
      id={id}
      className="bg-surface-2 rounded-lg border border-divider/50 overflow-hidden scroll-mt-48"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-3">
        {/* 아이콘 */}
        {imageUrl && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-4 border border-divider/50 shrink-0">
            <Image
              src={imageUrl}
              alt={name}
              width={40}
              height={40}
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* 이름 + 배지 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-medium text-on-surface truncate">{name}</span>
          <ChangeBadge type={changeType} />
        </div>

        {/* 요약 */}
        <span className="text-sm text-on-surface-medium truncate hidden sm:block max-w-[200px]">
          {summary}
        </span>
      </div>

      {/* 상세 내용 - 항상 펼쳐진 상태 */}
      <div className="px-4 pb-4 pt-2 border-t border-divider/50">
        {/* 요약 (모바일에서만 표시) */}
        <p className="text-sm text-on-surface-medium mb-3 sm:hidden">
          {summary}
        </p>

        {/* 변경 상세 */}
        {details.length > 0 && (
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div
                key={index}
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
                  <span className="text-win font-medium">{detail.after}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {details.length === 0 && (
          <p className="text-sm text-on-surface-medium">{summary}</p>
        )}
      </div>
    </div>
  );
}
