import { useQuery } from "@tanstack/react-query";
import {
  getPersonContracts,
  getPersonSummonerLinks,
  getRosterIssues,
} from "../api/esportsAdminApi";
import type { AdminSummonerLink, Contract, RosterIssue } from "../types";
import { esportsKeys } from "./esportsKeys";

/**
 * 관리자 조회 hook. 관리자 화면은 방금 바꾼 값을 바로 봐야 하므로 캐시를 오래 두지 않는다.
 * 등록·수정(mutation)은 각 화면의 features 슬라이스에서 esportsAdminApi 함수를 useMutation 으로 감싸고,
 * 성공하면 `esportsKeys.all` 을 무효화한다.
 */

export function usePersonSummonerLinks(personId: string) {
  return useQuery<AdminSummonerLink[], Error>({
    queryKey: esportsKeys.admin.summonerLinks(personId),
    queryFn: () => getPersonSummonerLinks(personId),
    enabled: !!personId,
  });
}

export function usePersonContracts(personId: string) {
  return useQuery<Contract[], Error>({
    queryKey: esportsKeys.admin.contracts(personId),
    queryFn: () => getPersonContracts(personId),
    enabled: !!personId,
  });
}

export function useRosterIssues() {
  return useQuery<RosterIssue[], Error>({
    queryKey: esportsKeys.admin.rosterIssues(),
    queryFn: () => getRosterIssues(),
  });
}
