// 공개 조회
export {
  getEsportsLeagues,
  getLeagueSeasons,
  getEsportsTeams,
  getTeamDetail,
  getTeamRoster,
  getTeamMembers,
  getSeasonRosters,
  searchPersons,
  getPersonProfile,
  getPersonCareer,
  getPersonBySummoner,
  SUMMONER_PERSON_TIMEOUT_MS,
} from "./api/esportsApi";

// 관리자
export {
  createLeague,
  updateLeague,
  createSeason,
  updateSeason,
  createTeam,
  updateTeam,
  renameTeam,
  correctTeamCurrentName,
  updateTeamNameHistory,
  deleteTeamNameHistory,
  disbandTeam,
  createPerson,
  updatePerson,
  deletePerson,
  getPersonSummonerLinks,
  linkSummoner,
  unlinkSummoner,
  recordSigning,
  recordRenewal,
  recordTransfer,
  recordMove,
  recordLoan,
  recordLoanRecall,
  recordRelease,
  recordRetirement,
  recordUnretirement,
  recordHiatus,
  recordReturn,
  getPersonContracts,
  correctContract,
  deleteContract,
  deleteCareerEvent,
  getRosterIssues,
} from "./api/esportsAdminApi";

// 쿼리
export { esportsKeys } from "./model/esportsKeys";
export {
  useEsportsLeagues,
  useLeagueSeasons,
  useEsportsTeams,
  useTeamDetail,
  useTeamRoster,
  useTeamMembers,
  useSeasonRosters,
  usePersonSearch,
  usePersonProfile,
  usePersonCareer,
  useSummonerPerson,
} from "./model/useEsportsQueries";
export {
  usePersonSummonerLinks,
  usePersonContracts,
  useRosterIssues,
} from "./model/useEsportsAdminQueries";

// lib
export {
  esportsHomeHref,
  esportsTeamHref,
  esportsPersonHref,
  stoveLeagueHref,
  adminEsportsHref,
} from "./lib/routes";
export {
  parseLocalDate,
  todayInSeoul,
  globalContractEndDate,
  nextGlobalContractEndDate,
} from "./lib/date";
export { organizationIdOf, indexTeams } from "./lib/teams";
export { formatDotDate, formatDotYearMonth, fullYearsBetween, durationParts } from "./lib/format";
export { startingLineup, splitStaff, currentTenureStarts } from "./lib/lineup";
export type { StartingLineup } from "./lib/lineup";
export { buildCareerTimeline } from "./lib/career";
export type { CareerItem, CareerRow } from "./lib/career";

// 타입·코드값
export {
  PERSON_STATUSES,
  ESPORTS_ROLES,
  ESPORTS_POSITIONS,
  CONTRACT_STATUSES,
  CONTRACT_TYPES,
  END_REASONS,
  CAREER_EVENT_TYPES,
  HIATUS_REASONS,
  ROSTER_PROBLEMS,
} from "./types";
export type * from "./types";
