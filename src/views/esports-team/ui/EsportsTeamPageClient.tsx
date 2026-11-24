"use client";

import { Footer, Header, Navigation } from "@/widgets/layout";
import { BenchBar, StartingFive, TeamHero, type OrganizationTeamLink } from "@/widgets/esports-team";
import {
  currentTenureStarts,
  leagueLabel,
  splitStaff,
  startingLineup,
  todayInSeoul,
  type EsportsLeague,
  type EsportsTeamDetail,
  type TeamMember,
  type TeamRoster,
} from "@/entities/esports";

interface EsportsTeamPageClientProps {
  detail: EsportsTeamDetail;
  roster: TeamRoster;
  /** 합류일 계산용. 못 받았으면 빈 배열(합류일은 지금 계약 시작일로 대신한다). */
  members: TeamMember[];
  leagues: EsportsLeague[];
  seasonYear: number | null;
}

/** 팀 상세 — 주전 다섯 명을 크게 세우고, 감독·코치와 후보는 벤치 한 줄로 둔다(시안 2-F). */
export default function EsportsTeamPageClient({
  detail,
  roster,
  members,
  leagues,
  seasonYear,
}: EsportsTeamPageClientProps) {
  const { team, organizationTeams } = detail;
  const today = todayInSeoul();
  const labelOf = (leagueId: string | null) => {
    const league = leagues.find((item) => item.leagueId === leagueId);
    return league ? leagueLabel(league) : null;
  };
  const orgLinks: OrganizationTeamLink[] = organizationTeams.map((other) => ({
    team: other,
    leagueLabel: labelOf(other.homeLeagueId),
  }));
  const lineup = startingLineup(roster.players);
  const { headCoaches, coaches } = splitStaff(roster.staff);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <Navigation />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-4 py-8 sm:px-6">
        <TeamHero
          team={team}
          leagueLabel={labelOf(team.homeLeagueId)}
          seasonYear={seasonYear}
          organizationTeams={orgLinks}
        />
        <StartingFive lineup={lineup} joinDates={currentTenureStarts(members, today)} today={today} />
        <BenchBar headCoaches={headCoaches} coaches={coaches} subs={lineup.subs} organizationTeams={orgLinks} />
      </main>
      <Footer />
    </div>
  );
}
