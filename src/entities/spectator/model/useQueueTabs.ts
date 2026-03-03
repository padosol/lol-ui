import { getQueueTabs } from "../api/spectatorApi";
import type { QueueTab } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useQueueTabs() {
  return useQuery<QueueTab[], Error>({
    queryKey: ["queueTabs"],
    queryFn: getQueueTabs,
    staleTime: 60 * 60 * 1000,
  });
}
