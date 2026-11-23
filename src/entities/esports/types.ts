/**
 * e스포츠 로스터 API 타입. lol-server `feat/esports-roster-schema`(b87ce9f4) 의 실제 DTO 를 그대로 옮겼다.
 * JSON 키는 Java record 컴포넌트 이름 그대로이고, null 필드는 생략되지 않고 null 로 온다.
 */

/** "YYYY-MM-DD". 모든 기간은 양 끝을 포함한다(lastDay 는 그날까지 유효). */
export type LocalDate = string;

// ---------------------------------------------------------------------------
// 코드값. 표시 이름은 i18n `domain.esports.*` 에 있다.
// ---------------------------------------------------------------------------

/** 인물 상태(조회 시점 DB CURRENT_DATE 기준 유도). 계약·사건 이력이 없는 인물은 상태가 없다(null). */
export const PERSON_STATUSES = ["CONTRACTED", "ON_LOAN", "FREE_AGENT", "RETIRED"] as const;
export type PersonStatus = (typeof PERSON_STATUSES)[number];

/** 플레잉코치는 PLAYER 다. */
export const ESPORTS_ROLES = ["PLAYER", "HEAD_COACH", "COACH"] as const;
export type EsportsRole = (typeof ESPORTS_ROLES)[number];

/**
 * 선수 포지션. 배열 순서가 로스터 표시 순서다. 스태프는 포지션이 없다(null).
 * 전적 화면의 포지션 코드(TOP/JUNGLE/MID/ADC/SUPPORT)와 다르다.
 */
export const ESPORTS_POSITIONS = ["TOP", "JGL", "MID", "AD", "SPT"] as const;
export type EsportsPosition = (typeof ESPORTS_POSITIONS)[number];

export const CONTRACT_STATUSES = ["UPCOMING", "ACTIVE", "ENDED"] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

/** 계약 시작 유형. MOVE = 같은 조직 안 팀 내 이동(콜업·샌드다운·역할·포지션 변경). */
export const CONTRACT_TYPES = ["SIGN", "TRANSFER", "RENEWAL", "LOAN", "MOVE"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

/** 종료 사유. EXPIRED 는 응답에서만 나온다(유도값) — 정정 요청에 넣을 수 없다. */
export const END_REASONS = [
  "EXPIRED",
  "RENEWED",
  "TRANSFERRED",
  "RELEASED",
  "RETIRED",
  "RECALLED",
  "MOVED",
] as const;
export type EndReason = (typeof END_REASONS)[number];

export const CAREER_EVENT_TYPES = ["RETIRE", "UNRETIRE", "HIATUS", "RETURN"] as const;
export type CareerEventType = (typeof CAREER_EVENT_TYPES)[number];

/** 비활동 사유. HIATUS 사건에만 붙는다. PERSONAL 은 원 소속팀 동의 없는 임의 탈퇴를 포함한다. */
export const HIATUS_REASONS = ["REST", "SUSPENSION", "MILITARY", "PERSONAL"] as const;
export type HiatusReason = (typeof HIATUS_REASONS)[number];

/** 검증 결과(roster-issues)의 문제 유형. 서버 뷰 v_esports_roster_invalid 의 문자열이다. */
export const ROSTER_PROBLEMS = [
  "RENEWAL_NOT_CONTINUOUS",
  "MOVE_NOT_CONTINUOUS",
  "MOVE_OUTSIDE_ORG",
  "MOVE_END_DATE_CHANGED",
  "MOVE_PLAYER_STAFF_SWITCH",
  "TRANSFER_WITHOUT_RELEASE",
  "PLAYER_AFTER_RETIRE",
  "RETIRED_WITHOUT_EVENT",
  "CONTRACT_AFTER_DISBAND",
  "TEAM_NAME_GAP",
  "TEAM_NESTED_TOO_DEEP",
  "SIGN_DURING_RETIRE_RIGHTS",
  "EARLY_END_WITHOUT_SUCCESSOR",
] as const;
export type RosterProblem = (typeof ROSTER_PROBLEMS)[number];

// ---------------------------------------------------------------------------
// 공개 조회 응답 — GET /api/v1/esports/**
// ---------------------------------------------------------------------------

/** 리그. 목록은 지역/국제로 묶이지 않은 평평한 배열이고 active=false 도 섞여 온다. */
export interface EsportsLeague {
  leagueId: string;
  name: string;
  nameAcronym: string | null;
  region: string | null;
  /** false = 지역 리그, true = 국제 대회 */
  international: boolean;
  imageUrl: string | null;
  darkImageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface EsportsSeason {
  seasonId: string;
  leagueId: string;
  name: string;
  nameAcronym: string | null;
  year: number | null;
  /** 시작·종료일이 null 이면 서버가 열린 범위로 계산한다. */
  startDate: LocalDate | null;
  endDate: LocalDate | null;
  sortOrder: number;
}

/** 팀(공개용 — 관리자용 AdminTeam 과 모양이 다르다). */
export interface EsportsTeam {
  teamId: string;
  teamCode: string;
  name: string;
  nameEng: string | null;
  imageUrl: string | null;
  darkImageUrl: string | null;
  homeLeagueId: string | null;
  /** 있으면 CL(하위) 팀. 조직 ID = parentTeamId ?? teamId */
  parentTeamId: string | null;
  foundedAt: LocalDate | null;
  disbandedAt: LocalDate | null;
  nameSince: LocalDate | null;
}

/** 지나간 팀 이름. */
export interface EsportsTeamName {
  historyId: number;
  teamCode: string;
  name: string;
  nameEng: string | null;
  imageUrl: string | null;
  darkImageUrl: string | null;
  validFrom: LocalDate;
  validTo: LocalDate;
}

export interface EsportsTeamDetail {
  team: EsportsTeam;
  /** validFrom 내림차순 */
  pastNames: EsportsTeamName[];
  /** 같은 조직의 다른 팀(상위 팀 먼저). 자기 자신은 빠진다. LCK ↔ CL 전환에 쓴다. */
  organizationTeams: EsportsTeam[];
}

export interface RosterEntry {
  personId: string;
  nickName: string;
  imageUrl: string | null;
  nationality: string | null;
  role: EsportsRole;
  /** 스태프면 null */
  position: EsportsPosition | null;
  contractType: ContractType;
  startDate: LocalDate;
  /** null = 만료일 미공개 */
  lastDay: LocalDate | null;
  /** 임대 온 선수(contractType === "LOAN") */
  onLoan: boolean;
  /** 임대 온 선수의 원 소속팀 ID */
  loanFromTeamId: string | null;
  inactive: boolean;
  inactiveReason: HiatusReason | null;
}

/** 이 팀 계약인데 지금 다른 팀에 임대 간 선수. players 에는 없다. */
export interface LoanedOutEntry {
  personId: string;
  nickName: string;
  position: EsportsPosition | null;
  loanTeamId: string;
  loanLastDay: LocalDate | null;
}

export interface TeamRoster {
  teamId: string;
  /** 포지션 순(TOP→SPT) → 시작일 */
  players: RosterEntry[];
  /** HEAD_COACH 먼저 → COACH */
  staff: RosterEntry[];
  loanedOut: LoanedOutEntry[];
}

/** 소속 기간 = 같은 조직·같은 역할군(선수/스태프)의 연속 계약 묶음. */
export interface Tenure {
  personId: string;
  nickName: string;
  organizationId: string;
  asPlayer: boolean;
  startDate: LocalDate;
  lastDay: LocalDate | null;
  /** 진행 중이면 null */
  endReason: EndReason | null;
  contractCount: number;
  renewalCount: number;
  loan: boolean;
  roles: EsportsRole[];
  /** 이 기간에 거친 팀 ID(T1A → T1 등). 이름은 팀 목록으로 매핑한다. */
  teamIds: string[];
}

export interface TeamMember {
  tenure: Tenure;
  /** 그 기간 안 이 팀 계약의 첫날 */
  teamStartDate: LocalDate | null;
  /** 끝 없는 계약이 하나라도 있으면 null */
  teamLastDay: LocalDate | null;
}

export interface SeasonRosterRow {
  seasonId: string;
  teamId: string;
  /** 시즌 시작일 당시 이름(시작일이 없으면 현재 이름) */
  teamCodeAtSeason: string;
  teamNameAtSeason: string;
  personId: string;
  nickName: string;
  role: EsportsRole;
  position: EsportsPosition | null;
  contractType: ContractType;
  startDate: LocalDate;
  lastDay: LocalDate | null;
}

/** 인물의 현재 상태와 보조 정보. 필드 이름이 status 라 접근은 `person.status.status` 다. */
export interface PersonStatusInfo {
  status: PersonStatus;
  /** 지금 뛰는 팀(ON_LOAN 이면 임차팀) */
  teamId: string | null;
  /** 정식(원) 계약 팀 */
  contractTeamId: string | null;
  role: EsportsRole | null;
  position: EsportsPosition | null;
  /** 정식 계약 마지막 날 */
  contractLastDay: LocalDate | null;
  inactive: boolean;
  inactiveReason: HiatusReason | null;
  /** 선수로 은퇴했음(은퇴 후 코치 등) */
  retiredAsPlayer: boolean;
  /** 확정된 다음(UPCOMING) 계약 */
  nextTeamId: string | null;
  nextStartDate: LocalDate | null;
  /** 계약 중 은퇴한 선수의 원 소속팀 권리(기간 안일 때만) */
  rightsTeamId: string | null;
  rightsUntil: LocalDate | null;
}

export interface PersonSummary {
  personId: string;
  nickName: string;
  realName: string | null;
  nationality: string | null;
  imageUrl: string | null;
  /** status.teamId 팀의 코드(임대 중이면 임차팀). FA·은퇴면 null */
  teamCode: string | null;
  /** 계약·사건 이력이 없는 인물은 null — FA 로 보여주면 안 된다 */
  status: PersonStatusInfo | null;
}

export interface PublicSummonerLink {
  puuid: string;
  main: boolean;
  visible: boolean;
  note: string | null;
}

export interface PersonProfile {
  personId: string;
  nickName: string;
  realName: string | null;
  realNameEng: string | null;
  birthDate: LocalDate | null;
  /** ISO alpha-2 */
  nationality: string | null;
  imageUrl: string | null;
  status: PersonStatusInfo | null;
  /** 공개(visible) 계정만, 대표(main) 먼저 */
  summoners: PublicSummonerLink[];
}

/** 계약. 관리자 계약 목록·정정 응답도 이 모양이다. */
export interface Contract {
  contractId: number;
  teamId: string;
  teamCode: string;
  role: EsportsRole;
  position: EsportsPosition | null;
  contractType: ContractType;
  startDate: LocalDate;
  /** 계약서상 만료일(null = 미공개) */
  endDate: LocalDate | null;
  /** 조기 종료일 */
  actualEndDate: LocalDate | null;
  /** actualEndDate ?? endDate */
  lastDay: LocalDate | null;
  status: ContractStatus;
  endReason: EndReason | null;
  note: string | null;
}

export interface CareerEvent {
  eventId: number;
  eventType: CareerEventType;
  eventDate: LocalDate;
  teamId: string | null;
  /** HIATUS 에만 */
  reason: HiatusReason | null;
  note: string | null;
  sourceUrl: string | null;
}

/** 세 배열이 따로 온다(각각 시간순). 타임라인은 화면이 합친다. */
export interface PersonCareer {
  personId: string;
  tenures: Tenure[];
  contracts: Contract[];
  events: CareerEvent[];
}

export interface PersonSearchParams {
  /** 활동명·실명 부분 일치. 비우면 계약·사건 이력이 있는 인물만 나온다 */
  q?: string;
  status?: PersonStatus;
  role?: EsportsRole;
  /** 지금 팀 또는 원 계약 팀 */
  teamId?: string;
  /** contractLastDay <= 이 날짜 */
  contractEndingBy?: LocalDate;
  /** 0 기반 */
  page?: number;
  /** 기본 20, 최대 100(넘으면 서버가 잘라낸다) */
  size?: number;
}

export interface TeamListParams {
  leagueId?: string;
  /** 기본 false — disbandedAt 이 오늘 이전인 팀만 빠진다 */
  includeDisbanded?: boolean;
}

// ---------------------------------------------------------------------------
// 관리자 응답 — /api/v1/admin/esports/** (ADMIN)
// ---------------------------------------------------------------------------

export interface AdminLeague extends EsportsLeague {
  gameCode: string;
}

export type AdminSeason = EsportsSeason;

export interface AdminTeam extends EsportsTeam {
  gameCode: string;
}

export interface AdminTeamNameHistory extends EsportsTeamName {
  teamId: string;
  note: string | null;
}

export interface AdminPerson {
  personId: string;
  nickName: string;
  realName: string | null;
  realNameEng: string | null;
  birthDate: LocalDate | null;
  nationality: string | null;
  imageUrl: string | null;
}

/** 관리자용 소환사 연결(비공개 포함). */
export interface AdminSummonerLink {
  puuid: string;
  personId: string;
  main: boolean;
  visible: boolean;
  note: string | null;
}

/** 계약 사건 POST 의 응답(201). */
export interface ContractEventResult {
  personId: string;
  /** 저장 후 인물 상태 */
  status: PersonStatusInfo | null;
  /** 이번에 생기거나 바뀐 계약 */
  contracts: Contract[];
  /** 이번에 생긴 사건 */
  events: CareerEvent[];
}

export interface RosterIssue {
  problem: RosterProblem;
  /** TEAM_NAME_GAP·TEAM_NESTED_TOO_DEEP 은 null — 팀 화면으로 보낸다 */
  personId: string | null;
  contractId: number | null;
  teamId: string | null;
  atDate: LocalDate | null;
}

// ---------------------------------------------------------------------------
// 관리자 요청.
// PUT·PATCH 는 전체 덮어쓰기다(빠진 필드는 null·기본값이 된다). 그래서 수정 요청 타입은
// 모든 키를 필수로 두고 값만 nullable 로 둔다 — 값을 빠뜨리면 컴파일이 막는다.
// ID 패턴: leagueId ^[a-z0-9_]{1,50}$, seasonId ^[a-z0-9_]{1,80}$, teamId·personId ^[a-z0-9_]{1,30}$
// ---------------------------------------------------------------------------

export interface CreateLeagueRequest {
  leagueId: string;
  name: string;
  nameAcronym?: string | null;
  region?: string | null;
  international?: boolean;
  imageUrl?: string | null;
  darkImageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateLeagueRequest {
  name: string;
  nameAcronym: string | null;
  region: string | null;
  international: boolean;
  imageUrl: string | null;
  darkImageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface CreateSeasonRequest {
  seasonId: string;
  name: string;
  nameAcronym?: string | null;
  year?: number | null;
  startDate?: LocalDate | null;
  /** startDate 이후 */
  endDate?: LocalDate | null;
  sortOrder?: number;
}

export interface UpdateSeasonRequest {
  name: string;
  nameAcronym: string | null;
  year: number | null;
  startDate: LocalDate | null;
  endDate: LocalDate | null;
  sortOrder: number;
}

export interface CreateTeamRequest {
  teamId: string;
  /** 20자 이하, 유일(중복이면 ESPORTS_ID_DUPLICATED) */
  teamCode: string;
  name: string;
  nameEng?: string | null;
  imageUrl?: string | null;
  darkImageUrl?: string | null;
  homeLeagueId?: string | null;
  /** 1단계만. 하위 팀이 있는 팀에는 지정할 수 없다 */
  parentTeamId?: string | null;
  foundedAt?: LocalDate | null;
  nameSince?: LocalDate | null;
}

/** 이름·코드·로고는 개명(renames)·현재 이름 정정(current-name)으로만 바꾼다. */
export interface UpdateTeamRequest {
  homeLeagueId: string | null;
  parentTeamId: string | null;
  foundedAt: LocalDate | null;
}

export interface RenameTeamRequest {
  /** 새 이름 시작일. 이전 이름의 validTo 는 그 전날이 된다 */
  renamedOn: LocalDate;
  teamCode: string;
  name: string;
  nameEng?: string | null;
  imageUrl?: string | null;
  darkImageUrl?: string | null;
  /** 현재 이름 시작일(nameSince·foundedAt)을 모를 때만 */
  previousNameFrom?: LocalDate | null;
  note?: string | null;
}

/** 현재 이름 오입력 정정(이력을 남기지 않는다). */
export interface CorrectTeamNameRequest {
  teamCode: string;
  name: string;
  nameEng: string | null;
  imageUrl: string | null;
  darkImageUrl: string | null;
  nameSince: LocalDate | null;
}

export interface TeamNameHistoryRequest {
  teamCode: string;
  name: string;
  nameEng: string | null;
  imageUrl: string | null;
  darkImageUrl: string | null;
  validFrom: LocalDate;
  validTo: LocalDate;
  note: string | null;
}

export interface DisbandTeamRequest {
  disbandedAt: LocalDate;
}

export interface CreatePersonRequest {
  personId: string;
  /** 중복 허용 */
  nickName: string;
  realName?: string | null;
  realNameEng?: string | null;
  birthDate?: LocalDate | null;
  /** ^[A-Z]{2}$ */
  nationality?: string | null;
  imageUrl?: string | null;
}

export interface UpdatePersonRequest {
  nickName: string;
  realName: string | null;
  realNameEng: string | null;
  birthDate: LocalDate | null;
  nationality: string | null;
  imageUrl: string | null;
}

/** 연결·수정 겸용. 생략하면 main=false, visible=true 로 덮이므로 셋 다 보낸다. */
export interface LinkSummonerRequest {
  main: boolean;
  visible: boolean;
  note: string | null;
}

/** 입단·재계약·이적. date 는 효력 발생일. */
export interface ContractEventRequest {
  teamId: string;
  role: EsportsRole;
  /** 선수면 필수, 스태프면 비워야 한다 */
  position?: EsportsPosition | null;
  date: LocalDate;
  /** 계약서상 만료일(GCD). 미공개면 생략 */
  endDate?: LocalDate | null;
  note?: string | null;
}

/** 팀 내 이동. 만료일은 직전 계약 것을 잇는다. */
export interface MoveRequest {
  teamId: string;
  role: EsportsRole;
  position?: EsportsPosition | null;
  date: LocalDate;
  note?: string | null;
}

export interface LoanRequest {
  teamId: string;
  /** 생략하면 원 계약 포지션 */
  position?: EsportsPosition | null;
  date: LocalDate;
  endDate: LocalDate;
  note?: string | null;
}

/** 임대 복귀·방출·은퇴·은퇴 번복·복귀. */
export interface DatedEventRequest {
  date: LocalDate;
  note?: string | null;
  sourceUrl?: string | null;
}

export interface HiatusRequest extends DatedEventRequest {
  reason?: HiatusReason | null;
}

/** 계약 오입력 정정. actualEndDate 와 endReason 은 짝이고 EXPIRED 는 넣을 수 없다. */
export interface CorrectContractRequest {
  startDate: LocalDate;
  endDate: LocalDate | null;
  actualEndDate: LocalDate | null;
  endReason: Exclude<EndReason, "EXPIRED"> | null;
  position: EsportsPosition | null;
  note: string | null;
}
