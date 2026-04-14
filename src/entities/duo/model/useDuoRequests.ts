import { useQuery } from "@tanstack/react-query";
import { getMyDuoRequests } from "../api/duoRequestApi";
import type { DuoRequestListResponse } from "../types";
import { duoKeys } from "./useDuoPosts";

export function useMyDuoRequests(page: number = 0) {
  return useQuery<DuoRequestListResponse, Error>({
    queryKey: [...duoKeys.myRequests(), page],
    queryFn: () => getMyDuoRequests(page),
    staleTime: 1 * 60 * 1000,
  });
}
