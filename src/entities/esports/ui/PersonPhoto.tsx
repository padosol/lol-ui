"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";

interface PersonPhotoProps {
  imageUrl: string | null;
  name: string;
  /**
   * tile: 테두리 있는 정사각 자리(머리 카드·목록).
   * portrait: 부모를 채우는 큰 실루엣(스타팅 파이브 카드). 부모가 크기와 위치를 정한다.
   */
  variant?: "tile" | "portrait";
  className?: string;
}

export default function PersonPhoto({ imageUrl, name, variant = "tile", className = "" }: PersonPhotoProps) {
  const t = useTranslations("esports.common");

  if (variant === "portrait") {
    // 부모가 준 상자(className)를 사진이 채운다. 절대 위치의 img 는 위·아래를 정해도 늘어나지 않아 감싼다.
    return imageUrl ? (
      <div className={className}>
        {/* 인물 사진은 관리자가 넣는 외부 주소라 next/image 허용 호스트에 미리 등록할 수 없다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={t("photo", { name })} className="size-full object-cover object-top" />
      </div>
    ) : (
      <div aria-hidden="true" className={`flex items-end justify-center text-on-surface/15 ${className}`}>
        <svg viewBox="0 0 24 28" fill="currentColor" className="h-full max-h-60 w-auto">
          <circle cx="12" cy="8" r="6" />
          <path d="M1 28a11 11 0 0 1 22 0z" />
        </svg>
      </div>
    );
  }

  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-divider bg-surface-2 ${className}`;
  return imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={t("photo", { name })} className={`${base} object-cover`} />
  ) : (
    <div aria-hidden="true" className={`${base} text-on-surface-disabled`}>
      <User className="size-2/5" strokeWidth={1.5} />
    </div>
  );
}
