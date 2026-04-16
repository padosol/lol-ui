"use client";

import { LogOut, User } from "lucide-react";
import { useLogout } from "@/features/auth";
import type { Tab } from "./MypagePanel";

interface MypageSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "account", label: "계정 관리", icon: User },
];

export default function MypageSidebar({
  activeTab,
  onTabChange,
}: MypageSidebarProps) {
  const { handleLogout } = useLogout();

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0">
        <nav className="bg-surface-1 rounded-xl border border-divider overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-surface-4 text-primary"
                    : "text-on-surface-medium hover:bg-surface-2 hover:text-on-surface"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 px-5 py-4 text-sm font-medium text-on-surface-medium hover:text-error transition-colors bg-surface-1 rounded-xl border border-divider"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </aside>

      {/* 모바일 탭 바 */}
      <div className="flex md:hidden border-b border-divider -mx-4 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors border-b-2 ${
                isActive
                  ? "text-primary border-primary"
                  : "text-on-surface-medium border-transparent hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
