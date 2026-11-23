import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  AdminLeague,
  AdminPerson,
  AdminSeason,
  AdminSummonerLink,
  AdminTeam,
  AdminTeamNameHistory,
  Contract,
  ContractEventRequest,
  ContractEventResult,
  CorrectContractRequest,
  CorrectTeamNameRequest,
  CreateLeagueRequest,
  CreatePersonRequest,
  CreateSeasonRequest,
  CreateTeamRequest,
  DatedEventRequest,
  DisbandTeamRequest,
  HiatusRequest,
  LinkSummonerRequest,
  LoanRequest,
  MoveRequest,
  RenameTeamRequest,
  RosterIssue,
  TeamNameHistoryRequest,
  UpdateLeagueRequest,
  UpdatePersonRequest,
  UpdateSeasonRequest,
  UpdateTeamRequest,
} from "../types";

/**
 * 관리자 API — /api/v1/admin/esports/** (ADMIN, 쿠키 인증).
 *
 * - 목록 조회 API 는 따로 없다. 리그·시즌·팀·인물 목록과 팀 상세·커리어는 공개 조회(esportsApi)를 쓴다.
 * - 거부 사유는 errorCode(E400·E409)가 아니라 서버 문구로만 구분된다 → `getApiErrorMessage` 로 그대로 보여준다.
 * - DELETE 는 204·바디 없음이다.
 * - USER 가 부르면 403(ApiResponse 아닌 바디) 또는 401 이 올 수 있다. 화면은 둘 다 권한 없음으로 본다.
 */
const BASE = "/v1/admin/esports";
const enc = encodeURIComponent;

async function post<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, body ?? {});
  return response.data.data;
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, body);
  return response.data.data;
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, body);
  return response.data.data;
}

async function get<T>(url: string): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url);
  return response.data.data;
}

async function remove(url: string): Promise<void> {
  await apiClient.delete(url);
}

// --- 리그·시즌 ---------------------------------------------------------------

export function createLeague(body: CreateLeagueRequest): Promise<AdminLeague> {
  return post(`${BASE}/leagues`, body);
}

export function updateLeague(leagueId: string, body: UpdateLeagueRequest): Promise<AdminLeague> {
  return put(`${BASE}/leagues/${enc(leagueId)}`, body);
}

export function createSeason(leagueId: string, body: CreateSeasonRequest): Promise<AdminSeason> {
  return post(`${BASE}/leagues/${enc(leagueId)}/seasons`, body);
}

export function updateSeason(seasonId: string, body: UpdateSeasonRequest): Promise<AdminSeason> {
  return put(`${BASE}/seasons/${enc(seasonId)}`, body);
}

// --- 팀 ---------------------------------------------------------------------

export function createTeam(body: CreateTeamRequest): Promise<AdminTeam> {
  return post(`${BASE}/teams`, body);
}

export function updateTeam(teamId: string, body: UpdateTeamRequest): Promise<AdminTeam> {
  return put(`${BASE}/teams/${enc(teamId)}`, body);
}

/** 개명. 현재 이름은 지나간 이름으로 넘어간다. POST 지만 응답은 200 이다. */
export function renameTeam(teamId: string, body: RenameTeamRequest): Promise<AdminTeam> {
  return post(`${BASE}/teams/${enc(teamId)}/renames`, body);
}

/** 현재 이름 오입력 정정. 이력을 남기지 않는다. */
export function correctTeamCurrentName(
  teamId: string,
  body: CorrectTeamNameRequest
): Promise<AdminTeam> {
  return patch(`${BASE}/teams/${enc(teamId)}/current-name`, body);
}

export function updateTeamNameHistory(
  teamId: string,
  historyId: number,
  body: TeamNameHistoryRequest
): Promise<AdminTeamNameHistory> {
  return put(`${BASE}/teams/${enc(teamId)}/name-history/${historyId}`, body);
}

export function deleteTeamNameHistory(teamId: string, historyId: number): Promise<void> {
  return remove(`${BASE}/teams/${enc(teamId)}/name-history/${historyId}`);
}

/** 해체. 해체일 이후까지 이어지는 계약이 있으면 409. POST 지만 응답은 200 이다. */
export function disbandTeam(teamId: string, body: DisbandTeamRequest): Promise<AdminTeam> {
  return post(`${BASE}/teams/${enc(teamId)}/disbandment`, body);
}

// --- 인물·소환사 연결 ----------------------------------------------------------

export function createPerson(body: CreatePersonRequest): Promise<AdminPerson> {
  return post(`${BASE}/persons`, body);
}

export function updatePerson(personId: string, body: UpdatePersonRequest): Promise<AdminPerson> {
  return put(`${BASE}/persons/${enc(personId)}`, body);
}

/** 계약·사건·소환사 연결이 있으면 409(PERSON_IN_USE). */
export function deletePerson(personId: string): Promise<void> {
  return remove(`${BASE}/persons/${enc(personId)}`);
}

/** 비공개 연결까지 모두. 공개 프로필의 summoners 는 visible 만 준다. */
export function getPersonSummonerLinks(personId: string): Promise<AdminSummonerLink[]> {
  return get(`${BASE}/persons/${enc(personId)}/summoners`);
}

/** 연결·수정 겸용. 다른 인물에 연결된 puuid 면 409(SUMMONER_ALREADY_LINKED). */
export function linkSummoner(
  personId: string,
  puuid: string,
  body: LinkSummonerRequest
): Promise<AdminSummonerLink> {
  return put(`${BASE}/persons/${enc(personId)}/summoners/${enc(puuid)}`, body);
}

/** 멱등. 다른 인물 소유면 409. */
export function unlinkSummoner(personId: string, puuid: string): Promise<void> {
  return remove(`${BASE}/persons/${enc(personId)}/summoners/${enc(puuid)}`);
}

// --- 계약 사건 (date = 효력 발생일, 응답 201) ------------------------------------

const events = (personId: string) => `${BASE}/persons/${enc(personId)}`;

export function recordSigning(personId: string, body: ContractEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/signings`, body);
}

export function recordRenewal(personId: string, body: ContractEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/renewals`, body);
}

export function recordTransfer(personId: string, body: ContractEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/transfers`, body);
}

export function recordMove(personId: string, body: MoveRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/moves`, body);
}

export function recordLoan(personId: string, body: LoanRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/loans`, body);
}

/** contractId 는 진행 중인 LOAN 계약이다. */
export function recordLoanRecall(
  personId: string,
  contractId: number,
  body: DatedEventRequest
): Promise<ContractEventResult> {
  return post(`${events(personId)}/loans/${contractId}/recall`, body);
}

export function recordRelease(personId: string, body: DatedEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/releases`, body);
}

export function recordRetirement(personId: string, body: DatedEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/retirements`, body);
}

export function recordUnretirement(personId: string, body: DatedEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/unretirements`, body);
}

export function recordHiatus(personId: string, body: HiatusRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/hiatuses`, body);
}

export function recordReturn(personId: string, body: DatedEventRequest): Promise<ContractEventResult> {
  return post(`${events(personId)}/returns`, body);
}

// --- 정정·검증 ----------------------------------------------------------------

/** 계약 원본(startDate 오름차순). 사건 목록은 공개 커리어(getPersonCareer)의 events 를 쓴다. */
export function getPersonContracts(personId: string): Promise<Contract[]> {
  return get(`${BASE}/persons/${enc(personId)}/contracts`);
}

/** 오입력 정정. 사건 규칙을 거치지 않으므로 어긋나면 roster-issues 에 나온다. */
export function correctContract(contractId: number, body: CorrectContractRequest): Promise<Contract> {
  return patch(`${BASE}/contracts/${contractId}`, body);
}

export function deleteContract(contractId: number): Promise<void> {
  return remove(`${BASE}/contracts/${contractId}`);
}

export function deleteCareerEvent(eventId: number): Promise<void> {
  return remove(`${BASE}/career-events/${eventId}`);
}

/** 검증 결과. 0건이 정상이다. */
export function getRosterIssues(): Promise<RosterIssue[]> {
  return get(`${BASE}/roster-issues`);
}
