"use client";

import { RsoConnectCard } from "@/features/rso-connect";

export default function ConnectedAppsSection() {
  return (
    <section>
      <h2 className="text-lg font-bold text-on-surface mb-2">연결된 앱</h2>
      <p className="text-sm text-on-surface-medium mb-6">
        외부 계정을 연동하여 추가 기능을 이용할 수 있습니다.
      </p>
      <div className="space-y-3">
        <RsoConnectCard />
      </div>
    </section>
  );
}
