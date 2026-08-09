"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import type { PostCategory } from "@/entities/community";

type CategoryValue = PostCategory | "ALL";

interface BoardSidebarProps {
  category: CategoryValue;
  onSelect: (category: CategoryValue) => void;
}

interface BoardGroup {
  /** community.board.group.* 메시지 키 */
  key: "community" | "info" | "esports";
  categories: PostCategory[];
}

/**
 * 좌측 게시판 트리 구성.
 *
 * 서버의 PostCategory 는 아직 평평한 목록이라, 어떤 카테고리를 어느 영역에
 * 묶을지는 이 표가 유일한 기준이다. 영역을 바꾸고 싶으면 여기만 고치면 된다.
 * e-스포츠 영역은 대응하는 카테고리가 아직 없어 비어 있다.
 */
const BOARD_GROUPS: BoardGroup[] = [
  { key: "community", categories: ["GENERAL", "HUMOR", "COMMUNITY"] },
  {
    key: "info",
    categories: [
      "TIPS_AND_GUIDES",
      "CHAMPION_DISCUSSION",
      "META_DISCUSSION",
      "PATCH_NOTES",
    ],
  },
  { key: "esports", categories: [] },
];

export default function BoardSidebar({ category, onSelect }: BoardSidebarProps) {
  const t = useTranslations("community");
  const tBoard = useTranslations("community.board");
  const tGroup = useTranslations("community.board.group");
  const tCategory = useTranslations("domain.postCategory");

  const itemClass = (active: boolean) =>
    `rounded-md px-2.5 py-2 text-left text-sm transition-colors cursor-pointer ${
      active
        ? "bg-primary/15 font-bold text-primary"
        : "text-on-surface-medium hover:bg-surface-4 hover:text-on-surface"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => onSelect("ALL")}
        aria-current={category === "ALL" ? "page" : undefined}
        className={itemClass(category === "ALL")}
      >
        {t("allCategories")}
      </button>

      {BOARD_GROUPS.map((group) => (
        <div key={group.key} className="flex flex-col gap-px">
          <div className="px-2.5 py-1.5 text-[11.5px] font-bold tracking-widest text-on-surface-disabled">
            {tGroup(group.key)}
          </div>

          {group.categories.length === 0 ? (
            <div className="px-2.5 py-2 text-sm text-on-surface-disabled">
              {tGroup("comingSoon")}
            </div>
          ) : (
            group.categories.map((value) => {
              const active = value === category;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSelect(value)}
                  aria-current={active ? "page" : undefined}
                  className={`${itemClass(active)} pl-4`}
                >
                  {tCategory(value)}
                </button>
              );
            })
          )}
        </div>
      ))}

      <div className="flex flex-col gap-px">
        <div className="px-2.5 py-1.5 text-[11.5px] font-bold tracking-widest text-on-surface-disabled">
          {tBoard("myActivity")}
        </div>
        <Link
          href="/mypage"
          className="rounded-md px-2.5 py-2 pl-4 text-sm text-on-surface-medium hover:bg-surface-4 hover:text-on-surface transition-colors"
        >
          {tBoard("myPosts")}
        </Link>
        <Link
          href="/mypage"
          className="rounded-md px-2.5 py-2 pl-4 text-sm text-on-surface-medium hover:bg-surface-4 hover:text-on-surface transition-colors"
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
