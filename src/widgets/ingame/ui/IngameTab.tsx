"use client";

import IngameHeader from "./IngameHeader";
import IngameTeam from "./IngameTeam";
import { useActiveGame } from "@/entities/spectator";
import { Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface IngameTabProps {
  region: string;
  puuid?: string | null;
}

export default function IngameTab({ region, puuid }: IngameTabProps) {
  const t = useTranslations("ingame");
  const tCommon = useTranslations("common");
  const tTeam = useTranslations("domain.team");
  const { data, isLoading, error, refetch } = useActiveGame(region, puuid);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-medium">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-2">
          {t("error", { message: error.message || t("errorFallback") })}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-surface rounded-lg text-sm"
        >
          {tCommon("retry")}
        </button>
      </div>
    );
  }

  // 게임 중이 아닌 경우
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Gamepad2 className="w-16 h-16 text-on-surface-medium mb-4" />
        <p className="text-on-surface text-lg font-medium mb-2">
          {t("notInGame")}
        </p>
        <p className="text-on-surface-medium text-sm">{t("notInGameHint")}</p>
      </div>
    );
  }

  const blueBans = data.bannedChampions?.filter((b) => b.teamId === 100) || [];
  const redBans = data.bannedChampions?.filter((b) => b.teamId === 200) || [];

  return (
    <div className="space-y-3">
      <IngameHeader data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 블루팀 */}
        <IngameTeam
          participants={data.participants ?? []}
          teamId={100}
          teamName={tTeam("blue")}
          teamColor="text-team-blue"
          bannedChampions={blueBans}
        />

        {/* 레드팀 */}
        <IngameTeam
          participants={data.participants ?? []}
          teamId={200}
          teamName={tTeam("red")}
          teamColor="text-team-red"
          bannedChampions={redBans}
        />
      </div>
    </div>
  );
}
