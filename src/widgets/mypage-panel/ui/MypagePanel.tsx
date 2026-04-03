"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MypageSidebar from "./MypageSidebar";
import AccountSection from "./AccountSection";
import ConnectedAppsSection from "./ConnectedAppsSection";
export type Tab = "account" | "connected-apps";

function MypagePanelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("tab") as Tab) || "account";

  function handleTabChange(newTab: Tab) {
    router.replace(`/mypage?tab=${newTab}`);
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <MypageSidebar activeTab={tab} onTabChange={handleTabChange} />
      <div className="flex-1 min-w-0">
        {tab === "account" && <AccountSection />}
        {tab === "connected-apps" && <ConnectedAppsSection />}
      </div>
    </div>
  );
}

export default function MypagePanel() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MypagePanelContent />
    </Suspense>
  );
}
