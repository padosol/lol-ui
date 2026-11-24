"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import {
  ESPORTS_POSITIONS,
  PersonPhoto,
  esportsPersonHref,
  formatDotYearMonth,
  fullYearsBetween,
  type EsportsPosition,
  type LocalDate,
  type RosterEntry,
  type StartingLineup,
} from "@/entities/esports";

interface StartingFiveProps {
  lineup: StartingLineup;
  /** 인물 ID → 이 팀 합류일. 없으면 지금 계약 시작일로 대신한다. */
  joinDates: Map<string, LocalDate>;
  today: LocalDate;
}

/** 면의 밝기를 번갈아 써 다섯 장이 한 덩어리로 붙어 보이게 한다. */
const SURFACES = ["bg-surface-1", "bg-surface-2", "bg-surface-4", "bg-surface-2", "bg-surface-1"];

/** 폰에서는 한 줄에 두 장(낮게), 넓은 화면에서는 다섯 장이 한 줄. */
const CARD =
  "relative flex h-[300px] min-w-0 flex-[1_1_160px] flex-col justify-between overflow-hidden px-4 py-4 text-on-surface sm:h-[520px] sm:px-[18px] sm:py-5";

export default function StartingFive({ lineup, joinDates, today }: StartingFiveProps) {
  const t = useTranslations("esports.team");

  return (
    <section aria-label={t("startingFive")} className="flex flex-wrap gap-0.5 overflow-hidden rounded-xl">
      {ESPORTS_POSITIONS.map((position, index) => {
        const player = lineup.starters[position];
        const surface = SURFACES[index];
        return player ? (
          <PlayerCard
            key={position}
            player={player}
            position={position}
            joined={joinDates.get(player.personId) ?? player.startDate}
            today={today}
            className={`${CARD} ${surface} transition-colors hover:bg-surface-8`}
          />
        ) : (
          <div key={position} className={`${CARD} ${surface}`}>
            <PositionLabel position={position} />
            <span className="text-2xl font-black uppercase text-on-surface-disabled">{t("emptySlot")}</span>
          </div>
        );
      })}
    </section>
  );
}

function PlayerCard({
  player,
  position,
  joined,
  today,
  className,
}: {
  player: RosterEntry;
  position: EsportsPosition;
  joined: LocalDate;
  today: LocalDate;
  className: string;
}) {
  const t = useTranslations("esports.team");
  const tHiatus = useTranslations("domain.esports.hiatusReason");
  const joinedLabel = formatDotYearMonth(joined);

  return (
    <Link href={esportsPersonHref(player.personId)} className={className}>
      <div className="relative flex items-baseline justify-between">
        <PositionLabel position={position} />
        <span className="text-xs text-on-surface-medium">
          {t("yearOnTeam", { n: fullYearsBetween(joined, today) + 1 })}
        </span>
      </div>
      <PersonPhoto
        variant="portrait"
        imageUrl={player.imageUrl}
        name={player.nickName}
        className="absolute inset-x-0 bottom-[110px] top-12 sm:bottom-[150px] sm:top-16"
      />
      <div className="relative">
        {player.inactive && (
          <span className="mb-2 inline-flex rounded-full border border-on-surface/25 px-2 py-0.5 text-[11px] font-semibold">
            {player.inactiveReason
              ? `${t("inactive")} · ${tHiatus(player.inactiveReason)}`
              : t("inactive")}
          </span>
        )}
        <div className="break-words text-2xl font-black uppercase leading-7 tracking-[-0.02em] [overflow-wrap:anywhere] sm:text-[34px] sm:leading-[38px]">
          {player.nickName}
        </div>
        <div className="mt-2.5 border-t border-on-surface/25 pt-2.5 text-xs text-on-surface-medium">
          {player.lastDay
            ? t("joinedUntil", { joined: joinedLabel, until: formatDotYearMonth(player.lastDay) })
            : t("joinedUndisclosed", { joined: joinedLabel })}
        </div>
      </div>
    </Link>
  );
}

function PositionLabel({ position }: { position: EsportsPosition }) {
  const tPosition = useTranslations("domain.esports.position");
  return (
    <span className="relative text-[13px] font-bold leading-5 tracking-[0.12em] text-primary">
      {tPosition(position)}
    </span>
  );
}
