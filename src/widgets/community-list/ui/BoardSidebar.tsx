"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import { POST_CATEGORIES } from "@/entities/community";
import type { PostCategory } from "@/entities/community";

type CategoryValue = PostCategory | "ALL";

interface BoardSidebarProps {
  category: CategoryValue;
  onSelect: (category: CategoryValue) => void;
}

const CATEGORIES: CategoryValue[] = ["ALL", ...POST_CATEGORIES];

export default function BoardSidebar({ category, onSelect }: BoardSidebarProps) {
  const t = useTranslations("community");
  const tBoard = useTranslations("community.board");
  const tCategory = useTranslations("domain.postCategory");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-px">
        <div className="px-2.5 py-1.5 text-[11.5px] font-bold tracking-widest text-on-surface-disabled">
          {tBoard("sectionTitle")}
        </div>
        {CATEGORIES.map((value) => {
          const active = value === category;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-2.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                active
                  ? "bg-primary/15 font-bold text-primary"
                  : "text-on-surface-medium hover:bg-surface-4 hover:text-on-surface"
              }`}
            >
              {value === "ALL" ? t("allCategories") : tCategory(value)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-px">
        <div className="px-2.5 py-1.5 text-[11.5px] font-bold tracking-widest text-on-surface-disabled">
          {tBoard("myActivity")}
        </div>
        <Link
          href="/mypage"
          className="rounded-md px-2.5 py-2 text-sm text-on-surface-medium hover:bg-surface-4 hover:text-on-surface transition-colors"
        >
          {tBoard("myPosts")}
        </Link>
        <Link
          href="/mypage"
          className="rounded-md px-2.5 py-2 text-sm text-on-surface-medium hover:bg-surface-4 hover:text-on-surface transition-colors"
        >
          {tBoard("bookmarks")}
        </Link>
      </div>

      <div className="border-t border-divider pt-3.5 px-2.5 flex flex-col gap-2">
        <div className="text-[11.5px] font-bold tracking-widest text-on-surface-disabled">
          {tBoard("guideTitle")}
        </div>
        <ul className="flex flex-col gap-1.5 text-[11.5px] leading-relaxed text-on-surface-disabled">
          <li>· {tBoard("guideNoAbuse")}</li>
          <li>· {tBoard("guideAddContext")}</li>
          <li>· {tBoard("guideRepeatOffense")}</li>
        </ul>
      </div>
    </div>
  );
}
