"use client";

import { useMyDuoRequests } from "@/entities/duo";
import DuoRequestCard from "./DuoRequestCard";

export default function MyDuoRequestsPanel() {
  const { data, isLoading } = useMyDuoRequests();
  const requests = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-1 border border-divider rounded-lg p-4 animate-pulse h-[120px]"
          />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-disabled">
        보낸 요청이 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {requests.map((request) => (
        <DuoRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
