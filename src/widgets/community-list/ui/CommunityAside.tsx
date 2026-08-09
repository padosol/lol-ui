"use client";

import { Link } from "@/shared/i18n/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { usePosts } from "@/entities/community";
import TodayMatchesCard from "./TodayMatchesCard";
import LeagueStandingsCard from "./LeagueStandingsCard";

const HOT_LIMIT = 5;

export default function CommunityAside() {
  const format = useFormatter();
  const t = useTranslations("community.aside");
  const tCommunity = useTranslations("community");
  const tPost = useTranslations("community.post");
  const tComment = useTranslations("community.comment");
  const tPeriod = useTranslations("domain.postPeriod");

  // 목록과 별개로 "주간 인기글" 한 페이지만 받아 상위 5개만 노출한다.
  const { data, isLoading } = usePosts({ sort: "HOT", period: "WEEKLY" });
  const hotPosts = (data?.pages[0]?.content ?? []).slice(0, HOT_LIMIT);

  return (
    <div className="flex flex-col gap-3">
      <section className="bg-surface-1 border border-divider rounded-xl p-4">
        <div className="flex items-center mb-3">
          <h2 className="text-xs font-bold tracking-wider text-on-surface-disabled">
            {t("hotTitle")}
          </h2>
          <div className="flex-1" />
          <span className="text-[11.5px] font-semibold text-on-surface-disabled">
            {tPeriod("WEEKLY")}
          </span>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-on-surface-disabled">
            {tCommunity("loading")}
          </div>
        ) : hotPosts.length === 0 ? (
          <div className="py-6 text-center text-xs text-on-surface-disabled">
            {t("hotEmpty")}
          </div>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {hotPosts.map((post, index) => (
              <li key={post.id}>
                <Link
                  href={`/community/${post.id}`}
                  className="group flex gap-2.5 items-start"
                >
                  <span
                    className={`w-3.5 shrink-0 text-sm font-bold leading-snug ${
                      index < 3 ? "text-primary" : "text-on-surface-disabled"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] leading-snug text-on-surface group-hover:text-primary transition-colors">
                      {post.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] font-semibold text-on-surface-disabled">
                      {tComment("count", { count: post.commentCount })} ·{" "}
                      {tPost("viewCount", { count: format.number(post.viewCount) })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <TodayMatchesCard />
      <LeagueStandingsCard />
    </div>
  );
}
