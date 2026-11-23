"use client";

import { calcWinRateCeil2, getWinRateTextClass } from "@/entities/champion";
import { getKDAColorClass } from "@/shared/lib/game";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { calcKdaRatio, type MostChampion } from "../lib/profileCover";

const HEXAGON = "[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]";

const BAR_CLASS =
  "relative mt-auto flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-2 md:justify-between border-t border-divider bg-surface/90 px-4 py-3 md:h-[78px] md:px-6 md:py-0 tabular-nums";

const STAT_CLASS =
  "text-lg md:text-2xl font-extrabold leading-tight whitespace-nowrap";

/** "MOST 1" 육각 엠블럼. 의미는 바의 aria-label 이 전하므로 장식으로 둔다. */
function MostEmblem() {
  return (
    <div aria-hidden="true" className={`relative shrink-0 w-10 h-[46px] bg-gold ${HEXAGON}`}>
      <div
        className={`absolute inset-0.5 flex flex-col items-center justify-center bg-surface text-gold ${HEXAGON}`}
      >
        <span className="ml-[0.14em] text-[7px] font-bold leading-none tracking-[0.14em]">
          MOST
        </span>
        <span className="mt-0.5 text-[19px] font-extrabold leading-none">1</span>
      </div>
    </div>
  );
}

function Divider() {
  return <span aria-hidden="true" className="hidden md:block h-10 w-px bg-divider" />;
}

function Unit({ children }: { children: ReactNode }) {
  return <span className="ml-px text-sm md:text-base font-semibold">{children}</span>;
}

function Slash() {
  return (
    <span aria-hidden="true" className="font-normal text-on-surface-disabled">
      {" / "}
    </span>
  );
}

interface MostChampionBarProps {
  most: MostChampion;
  /** 게임 데이터에서 찾은 표시 이름 (예: "아리") */
  championName: string;
}

/** 프로필 커버 하단의 모스트 1 챔피언 요약 바. */
export default function MostChampionBar({ most, championName }: MostChampionBarProps) {
  const t = useTranslations("summoner.cover");
  const tQueue = useTranslations("domain.leagueType");
  const { stat } = most;

  const queueName =
    most.queue === "solo" ? tQueue("RANKED_SOLO_5x5") : tQueue("RANKED_FLEX_SR");
  const winRate = calcWinRateCeil2(stat.win, stat.playCount);
  const kdaRatio = calcKdaRatio(stat.kills, stat.deaths, stat.assists);
  const unit = (chunks: ReactNode) => <Unit>{chunks}</Unit>;

  return (
    <section
      aria-label={t("mostChampion", { queue: queueName, champion: championName })}
      className={BAR_CLASS}
    >
      <div className="flex items-center gap-3 basis-full md:basis-auto min-w-0">
        <MostEmblem />
        <span className="text-xl md:text-2xl font-extrabold leading-tight text-on-surface truncate">
          {championName}
        </span>
      </div>
      <Divider />
      <div className={`${STAT_CLASS} text-on-surface`}>
        {t.rich("games", { count: stat.playCount, unit })}
      </div>
      <Divider />
      <div className={`${STAT_CLASS} text-on-surface`}>
        {t.rich("wins", { count: stat.win, unit })}{" "}
        <span className="text-on-surface-medium">
          {t.rich("losses", { count: stat.losses, unit })}
        </span>
      </div>
      <Divider />
      <div className={`${STAT_CLASS} ${getWinRateTextClass(winRate)}`}>
        <span className="sr-only">{t("winRate")} </span>
        {winRate.toFixed(2)}%
      </div>
      <Divider />
      <div className={`${STAT_CLASS} text-on-surface`}>
        <span className="sr-only">{t("averageKda")} </span>
        {stat.kills.toFixed(1)}
        <Slash />
        <span className="text-loss">{stat.deaths.toFixed(1)}</span>
        <Slash />
        {stat.assists.toFixed(1)}
      </div>
      <Divider />
      <div className={`${STAT_CLASS} ${getKDAColorClass(kdaRatio)}`}>
        <span className="sr-only">{t("kdaRatio")} </span>
        {kdaRatio === "perfect" ? "Perfect" : `${kdaRatio}:1`}
      </div>
    </section>
  );
}

/** 모스트 챔피언을 받는 동안 바 자리를 잡아 둔다 (커버 높이가 뒤늦게 바뀌지 않게). */
export function MostChampionBarSkeleton() {
  const t = useTranslations("summoner.cover");

  return (
    <div role="status" className={BAR_CLASS}>
      <span className="sr-only">{t("loading")}</span>
      <div className="flex items-center gap-3 basis-full md:basis-auto">
        <div aria-hidden="true" className={`w-10 h-[46px] bg-surface-4 animate-pulse ${HEXAGON}`} />
        <div aria-hidden="true" className="h-6 w-20 rounded bg-surface-4 animate-pulse" />
      </div>
      {[64, 96, 80, 136, 72].map((width) => (
        <div
          key={width}
          aria-hidden="true"
          className="h-6 rounded bg-surface-4 animate-pulse"
          style={{ width }}
        />
      ))}
    </div>
  );
}
