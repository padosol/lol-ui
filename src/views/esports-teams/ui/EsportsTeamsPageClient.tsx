"use client";

import { useTranslations } from "next-intl";
import { Footer, Header, Navigation } from "@/widgets/layout";
import { LeagueTabs, TeamRosterCard } from "@/widgets/esports-teams";
import { leagueLabel, type EsportsLeague, type EsportsTeam, type TeamRoster } from "@/entities/esports";

interface EsportsTeamsPageClientProps {
  leagues: EsportsLeague[];
  leagueId: string | null;
  teams: EsportsTeam[];
  /** 팀 ID → 로스터(못 불러왔으면 null) */
  rosters: Record<string, TeamRoster | null>;
  seasonYear: number | null;
}

/** e-sports 첫 화면 — 리그의 팀마다 감독·코치진과 주전 다섯 명을 보여준다. */
export default function EsportsTeamsPageClient({
  leagues,
  leagueId,
  teams,
  rosters,
  seasonYear,
}: EsportsTeamsPageClientProps) {
  const t = useTranslations("esports.list");
  const league = leagues.find((item) => item.leagueId === leagueId) ?? null;
  const loaded = teams.flatMap((team) => rosters[team.teamId] ?? []);
  const players = loaded.reduce((sum, roster) => sum + roster.players.length, 0);
  const staff = loaded.reduce((sum, roster) => sum + roster.staff.length, 0);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <Navigation />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-primary pb-4">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.16em] text-on-surface-medium">
              {seasonYear ? t("seasonEyebrow", { year: String(seasonYear) }) : t("eyebrow")}
            </p>
            <h1 className="mt-1 text-[clamp(44px,8vw,104px)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-on-surface">
              {league ? t("title", { league: leagueLabel(league) }) : t("eyebrow")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {teams.length > 0 && (
              <span className="text-xs text-on-surface-medium">
                {t("summary", { teams: teams.length, players, staff })}
              </span>
            )}
            <LeagueTabs leagues={leagues} activeLeagueId={leagueId} />
          </div>
        </header>

        {teams.length === 0 ? (
          <p className="rounded-xl border border-divider bg-surface-1 px-4 py-12 text-center text-sm text-on-surface-medium">
            {t("empty")}
          </p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))] gap-4">
            {teams.map((team) => (
              <TeamRosterCard key={team.teamId} team={team} roster={rosters[team.teamId] ?? null} />
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
