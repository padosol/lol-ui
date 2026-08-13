"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import { categoryHref } from "@/entities/community";
import type { BoardGroupItem, PostCategory } from "@/entities/community";

type CategoryValue = PostCategory | "ALL";

interface BoardSidebarProps {
  category: CategoryValue;
  /** 서버가 그룹핑·정렬을 끝내서 보낸 트리. 받은 순서대로 그리면 된다. */
  groups: BoardGroupItem[];
  isLoading?: boolean;
}

/** 로딩 중 자리를 잡아둔다. 시드 기준 3그룹 8게시판이라 그 높이에 맞췄다. */
function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {[3, 2, 3].map((count, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-px">
          <div className="mx-2.5 my-1.5 h-3 w-14 rounded bg-surface-4" />
          {Array.from({ length: count }).map((_, itemIndex) => (
            <div key={itemIndex} className="mx-2.5 my-1 h-5 rounded bg-surface-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function BoardSidebar({
  category,
  groups,
  isLoading = false,
}: BoardSidebarProps) {
  const t = useTranslations("community");
  const tBoard = useTranslations("community.board");
  const tGroup = useTranslations("community.board.group");

  const itemClass = (active: boolean) =>
    `block rounded-md px-2.5 py-2 text-left text-sm transition-colors cursor-pointer ${
      active
        ? "bg-primary/15 font-bold text-primary"
        : "text-on-surface-medium hover:bg-surface-4 hover:text-on-surface"
    }`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-divider bg-surface-1 p-2">
      <Link
        href={categoryHref("ALL")}
        aria-current={category === "ALL" ? "page" : undefined}
        className={itemClass(category === "ALL")}
      >
        {t("allCategories")}
      </Link>

      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        groups.map((group) => {
          // 숨김 게시판은 사이드바에서 뺀다. 응답에는 남아 있어야 기존 글의
          // 배지 라벨을 해석할 수 있다.
          const visible = group.categories.filter((item) => item.visible);
          return (
            <div key={group.code} className="flex flex-col gap-px">
              <div className="px-2.5 py-1.5 text-[11.5px] font-bold tracking-widest text-on-surface-disabled">
                {group.name}
              </div>

              {visible.length === 0 ? (
                <div className="px-2.5 py-2 text-sm text-on-surface-disabled">
                  {tGroup("comingSoon")}
                </div>
              ) : (
                visible.map((item) => {
                  const active = item.code === category;
                  return (
                    <Link
                      key={item.code}
                      href={categoryHref(item.code)}
                      aria-current={active ? "page" : undefined}
                      className={`${itemClass(active)} pl-4`}
                    >
                      {item.name}
                    </Link>
                  );
                })
              )}
            </div>
          );
        })
      )}

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
          href="/mypage?tab=bookmarks"
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
