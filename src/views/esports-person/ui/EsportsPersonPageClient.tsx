"use client";

import { Footer, Header, Navigation } from "@/widgets/layout";
import { CareerTimeline, PersonBreadcrumb, PersonHeader, RosterSwitcher } from "@/widgets/esports-person";
import {
  indexTeams,
  leagueLabel,
  todayInSeoul,
  type EsportsLeague,
  type EsportsTeam,
  type PersonCareer,
  type PersonProfile,
  type TeamRoster,
} from "@/entities/esports";

interface EsportsPersonPageClientProps {
  profile: PersonProfile;
  career: PersonCareer;
  /** 팀 ID → 이름·로고 매핑용(해체 팀 포함) */
  teams: EsportsTeam[];
  leagues: EsportsLeague[];
  /** 지금 소속 팀 로스터(로스터 전환 줄). 팀이 없거나 못 받았으면 null */
  roster: TeamRoster | null;
}

/** 선수·감독·코치 상세 — 같은 화면이다. 역할에 따라 상태 패널의 역할 줄만 달라진다. */
export default function EsportsPersonPageClient({
  profile,
  career,
  teams,
  leagues,
  roster,
}: EsportsPersonPageClientProps) {
  const today = todayInSeoul();
  const teamsById = indexTeams(teams);
  const teamId = profile.status?.teamId ?? null;
  const team = teamId ? (teamsById.get(teamId) ?? null) : null;
  const league = team ? leagues.find((item) => item.leagueId === team.homeLeagueId) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <Navigation />
      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
        <PersonBreadcrumb
          nickName={profile.nickName}
          team={team}
          leagueLabel={league ? leagueLabel(league) : null}
        />
        {team && roster && <RosterSwitcher team={team} roster={roster} currentPersonId={profile.personId} />}
        <PersonHeader profile={profile} teamsById={teamsById} today={today} />
        <CareerTimeline career={career} teamsById={teamsById} today={today} />
      </main>
      <Footer />
    </div>
  );
}
