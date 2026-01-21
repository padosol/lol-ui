"use client";

import type { Match, MatchDetail, ParticipantData } from "@/types/api";
import { getChampionImageUrl } from "@/utils/champion";
import {
  extractItemIds,
  getItemImageUrl,
  getKDAColorClass,
} from "@/utils/game";
import Image from "next/image";
import DamageBar from "./DamageBar";

interface MatchDetailInfoProps {
  detail: MatchDetail;
  match: Match;
  isArena: boolean;
  blueTeam: ParticipantData[];
  redTeam: ParticipantData[];
  puuid: string | null;
}

export default function MatchDetailInfo({
  detail,
  match,
  isArena,
  blueTeam,
  redTeam,
  puuid,
}: MatchDetailInfoProps) {
  if (isArena) {
    const placementGroups = (detail.participantData || []).reduce((acc, p) => {
      const placement = p.placement || 999;
      if (!acc[placement]) acc[placement] = [];
      acc[placement].push(p);
      return acc;
    }, {} as Record<number, typeof detail.participantData>);

    const displayTeams = [];
    for (let i = 1; i <= 8; i++) {
      const team = placementGroups[i];
      if (team && team.length > 0) {
        displayTeams.push({
          team,
          placement: i,
        });
      }
    }

    // 아레나 모드 전체 참가자의 최대 피해량 및 받은 피해량 계산
    const allParticipants = detail.participantData || [];
    const maxDamageArena = Math.max(
      ...allParticipants.map((p) => p.totalDamageDealtToChampions || 0)
    );
    const maxDamageTakenArena = Math.max(
      ...allParticipants.map((p) => p.totalDamageDealtToChampions || 0) // 일단 피해량 데이터 사용
    );

    return (
      <div
        className="border-t border-divider/50 bg-surface-1/80 p-2 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          {displayTeams.map(({ team, placement }) => {
            const isMyTeam = team.some((p) => p.puuid === puuid);
            return (
              <div
                key={placement}
                className={`p-1.5 rounded ${
                  isMyTeam
                    ? "bg-loss/10 border border-loss/50"
                    : "bg-surface-4/30 border border-divider/50"
                }`}
              >
                <div className="text-on-surface text-[11px] font-semibold mb-1">
                  {placement}위
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {team.map((participant) => {
                    const participantItems = extractItemIds(
                      participant.item || participant.itemSeq
                    );
                    const participantKDA =
                      participant.deaths === 0
                        ? "perfect"
                        : participant.deaths > 0
                        ? (
                            (participant.kills + participant.assists) /
                            participant.deaths
                          ).toFixed(2)
                        : (participant.kills + participant.assists).toFixed(2);
                    const isMe = participant.puuid === puuid;
                    const damage = participant.totalDamageDealtToChampions || 0;
                    const damageTaken =
                      participant.totalDamageDealtToChampions || 0; // 일단 피해량 데이터 사용
                    const damagePercentage =
                      maxDamageArena > 0 ? (damage / maxDamageArena) * 100 : 0;
                    const damageTakenPercentage =
                      maxDamageTakenArena > 0
                        ? (damageTaken / maxDamageTakenArena) * 100
                        : 0;

                    return (
                      <div
                        key={participant.participantId}
                        className={`flex flex-col gap-0.5 p-1 rounded ${
                          isMe
                            ? "bg-loss/30 border border-loss/60"
                            : "bg-surface-4/20"
                        }`}
                      >
                        {/* 상단: 기본 정보 */}
                        <div className="flex items-start gap-1.5">
                          <div className="w-7 h-7 bg-surface-8 rounded overflow-hidden relative shrink-0">
                            <Image
                              src={getChampionImageUrl(
                                participant.championName || ""
                              )}
                              alt={participant.championName || "Unknown"}
                              fill
                              sizes="28px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-on-surface text-[11px] font-medium truncate">
                              {participant.riotIdGameName ||
                                participant.summonerName}
                            </div>
                            <div className="text-on-surface-medium text-[9px]">
                              {participant.championName}
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-0.5 text-[11px]">
                            <div className="text-on-surface font-semibold">
                              {participant.kills} /{" "}
                              <span className="text-loss">
                                {participant.deaths}
                              </span>{" "}
                              / {participant.assists}
                            </div>
                            <div className="text-[9px]">
                              <span
                                className={getKDAColorClass(participantKDA)}
                              >
                                {participantKDA === "perfect"
                                  ? "perfect"
                                  : `${participantKDA}:1 평점`}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-0.5">
                            {participantItems.slice(0, 6).map((itemId, idx) => (
                              <div
                                key={idx}
                                className="w-5 h-5 bg-surface-4 rounded border border-divider/50 overflow-hidden relative"
                              >
                                {itemId > 0 ? (
                                  <Image
                                    src={getItemImageUrl(itemId)}
                                    alt={`Item ${itemId}`}
                                    fill
                                    sizes="20px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-surface-4/50"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* 하단: 피해량 막대바 */}
                        <div className="flex gap-1.5">
                          {/* 피해량 막대 */}
                          <div className="flex items-center gap-1.5 flex-1">
                            <div className="text-on-surface-medium text-[9px] w-6 shrink-0">
                              피해
                            </div>
                            <div className="flex-1 h-2.5 bg-surface-8/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-warning/70 rounded-full transition-all"
                                style={{ width: `${damagePercentage}%` }}
                              />
                            </div>
                            <div className="text-warning text-[9px] w-10 text-right shrink-0">
                              {(damage / 1000).toFixed(1)}k
                            </div>
                          </div>
                          {/* 받은 피해량 막대 */}
                          <div className="flex items-center gap-1.5 flex-1">
                            <div className="text-on-surface-medium text-[9px] w-6 shrink-0">
                              피해
                            </div>
                            <div className="flex-1 h-2.5 bg-surface-8/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-team-blue/70 rounded-full transition-all"
                                style={{ width: `${damageTakenPercentage}%` }}
                              />
                            </div>
                            <div className="text-team-blue text-[9px] w-10 text-right shrink-0">
                              {(damageTaken / 1000).toFixed(1)}k
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 팀별 오브젝트 처치 수 계산
  const blueTeamStats = {
    baron: blueTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { baronKills?: number }).baronKills || 0),
      0
    ),
    dragon: blueTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { dragonKills?: number }).dragonKills || 0),
      0
    ),
    turret: blueTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { turretKills?: number }).turretKills || 0),
      0
    ),
    inhibitor: blueTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { inhibitorKills?: number }).inhibitorKills ||
          0),
      0
    ),
  };

  const redTeamStats = {
    baron: redTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { baronKills?: number }).baronKills || 0),
      0
    ),
    dragon: redTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { dragonKills?: number }).dragonKills || 0),
      0
    ),
    turret: redTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { turretKills?: number }).turretKills || 0),
      0
    ),
    inhibitor: redTeam.reduce(
      (sum, p) =>
        sum +
        ((p as ParticipantData & { inhibitorKills?: number }).inhibitorKills ||
          0),
      0
    ),
  };

  return (
    <div
      className="border-t border-divider/50 bg-surface-1/80 p-3 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-3">
        {/* 블루팀 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-team-blue text-xs font-semibold">
              블루팀 {blueTeam.some((p) => p.win) ? "승리" : "패배"}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-on-surface-medium">
              <span>바론 {blueTeamStats.baron}</span>
              <span>드래곤 {blueTeamStats.dragon}</span>
              <span>타워 {blueTeamStats.turret}</span>
              <span>억제기 {blueTeamStats.inhibitor}</span>
            </div>
          </div>
          {blueTeam.map((participant) => {
            const participantItems = extractItemIds(
              participant.item || participant.itemSeq
            );
            const participantTotalCS =
              (participant.totalMinionsKilled || 0) +
              (participant.neutralMinionsKilled || 0);
            const participantCsPerMin =
              match.gameDuration > 0
                ? (participantTotalCS / (match.gameDuration / 60)).toFixed(1)
                : "0.0";
            const participantKDA =
              participant.deaths === 0
                ? "perfect"
                : participant.deaths > 0
                ? (
                    (participant.kills + participant.assists) /
                    participant.deaths
                  ).toFixed(2)
                : (participant.kills + participant.assists).toFixed(2);
            const isMe = participant.puuid === puuid;
            const damage = participant.totalDamageDealtToChampions || 0;
            const damageTaken = participant.totalDamageTaken || 0; // 일단 피해량 데이터 사용
            const maxDamage = Math.max(
              ...blueTeam.map((p) => p.totalDamageDealtToChampions || 0),
              ...redTeam.map((p) => p.totalDamageDealtToChampions || 0)
            );
            const maxDamageTaken = Math.max(
              ...blueTeam.map((p) => p.totalDamageTaken || 0),
              ...redTeam.map((p) => p.totalDamageTaken || 0)
            );
            const damagePercentage =
              maxDamage > 0 ? (damage / maxDamage) * 100 : 0;
            const damageTakenPercentage =
              maxDamageTaken > 0 ? (damageTaken / maxDamageTaken) * 100 : 0;

            return (
              <div
                key={participant.participantId}
                className={`flex flex-col p-1 rounded ${
                  isMe
                    ? "bg-team-blue/20 border border-team-blue/50"
                    : "bg-surface-4/30"
                }`}
              >
                {/* 상단: 기본 정보 */}
                <div className="flex items-start gap-1.5">
                  <div className="w-7 h-7 bg-surface-8 rounded overflow-hidden relative shrink-0">
                    <Image
                      src={getChampionImageUrl(participant.championName || "")}
                      alt={participant.championName || "Unknown"}
                      fill
                      sizes="28px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-on-surface text-[11px] font-medium truncate">
                      {participant.riotIdGameName || participant.summonerName}
                    </div>
                    <div className="text-on-surface-medium text-[9px]">
                      {participant.championName}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 text-[11px]">
                    <div className="text-on-surface font-semibold">
                      {participant.kills} /{" "}
                      <span className="text-loss">{participant.deaths}</span>{" "}
                      / {participant.assists}
                    </div>
                    <div className="text-on-surface-medium text-[9px]">
                      {participantKDA === "perfect"
                        ? "perfect"
                        : `${participantKDA}:1 평점`}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 text-[11px]">
                    <div className="text-on-surface-medium text-[9px]">
                      {participantTotalCS}({participantCsPerMin})
                    </div>
                    <div className="text-gold text-[9px]">
                      {((participant.goldEarned || 0) / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5">
                    {participantItems.slice(0, 6).map((itemId, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 bg-surface-4 rounded border border-divider/50 overflow-hidden relative"
                      >
                        {itemId > 0 ? (
                          <Image
                            src={getItemImageUrl(itemId)}
                            alt={`Item ${itemId}`}
                            fill
                            sizes="20px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-4/50"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 하단: 피해량 막대바 */}
                <div className="flex gap-1.5">
                  <DamageBar
                    label="피해"
                    percentage={damagePercentage}
                    value={`${(damage / 1000).toFixed(1)}k`}
                    color="orange"
                  />
                  <DamageBar
                    label="받은 피해"
                    percentage={damageTakenPercentage}
                    value={`${(damageTaken / 1000).toFixed(1)}k`}
                    color="blue"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 레드팀 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-loss text-xs font-semibold">
              레드팀 {redTeam.some((p) => p.win) ? "승리" : "패배"}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-on-surface-medium">
              <span>바론 {redTeamStats.baron}</span>
              <span>드래곤 {redTeamStats.dragon}</span>
              <span>타워 {redTeamStats.turret}</span>
              <span>억제기 {redTeamStats.inhibitor}</span>
            </div>
          </div>
          {redTeam.map((participant) => {
            const participantItems = extractItemIds(
              participant.item || participant.itemSeq
            );
            const participantTotalCS =
              (participant.totalMinionsKilled || 0) +
              (participant.neutralMinionsKilled || 0);
            const participantCsPerMin =
              match.gameDuration > 0
                ? (participantTotalCS / (match.gameDuration / 60)).toFixed(1)
                : "0.0";
            const participantKDA =
              participant.deaths === 0
                ? "perfect"
                : participant.deaths > 0
                ? (
                    (participant.kills + participant.assists) /
                    participant.deaths
                  ).toFixed(2)
                : (participant.kills + participant.assists).toFixed(2);
            const isMe = participant.puuid === puuid;
            const damage = participant.totalDamageDealtToChampions || 0;
            const damageTaken = participant.totalDamageTaken || 0; // 일단 피해량 데이터 사용
            const maxDamage = Math.max(
              ...blueTeam.map((p) => p.totalDamageDealtToChampions || 0),
              ...redTeam.map((p) => p.totalDamageDealtToChampions || 0)
            );
            const maxDamageTaken = Math.max(
              ...blueTeam.map((p) => p.totalDamageTaken || 0),
              ...redTeam.map((p) => p.totalDamageTaken || 0)
            );
            const damagePercentage =
              maxDamage > 0 ? (damage / maxDamage) * 100 : 0;
            const damageTakenPercentage =
              maxDamageTaken > 0 ? (damageTaken / maxDamageTaken) * 100 : 0;

            return (
              <div
                key={participant.participantId}
                className={`flex flex-col p-1 rounded ${
                  isMe
                    ? "bg-team-red/20 border border-team-red/50"
                    : "bg-surface-4/30"
                }`}
              >
                {/* 상단: 기본 정보 */}
                <div className="flex items-start gap-1.5">
                  <div className="w-7 h-7 bg-surface-8 rounded overflow-hidden relative shrink-0">
                    <Image
                      src={getChampionImageUrl(participant.championName || "")}
                      alt={participant.championName || "Unknown"}
                      fill
                      sizes="28px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-on-surface text-[11px] font-medium truncate">
                      {participant.riotIdGameName || participant.summonerName}
                    </div>
                    <div className="text-on-surface-medium text-[9px]">
                      {participant.championName}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 text-[11px]">
                    <div className="text-on-surface font-semibold">
                      {participant.kills} /{" "}
                      <span className="text-loss">{participant.deaths}</span>{" "}
                      / {participant.assists}
                    </div>
                    <div className="text-on-surface-medium text-[9px]">
                      {participantKDA === "perfect"
                        ? "perfect"
                        : `${participantKDA}:1 평점`}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 text-[11px]">
                    <div className="text-on-surface-medium text-[9px]">
                      {participantTotalCS}({participantCsPerMin})
                    </div>
                    <div className="text-gold text-[9px]">
                      {((participant.goldEarned || 0) / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5">
                    {participantItems.slice(0, 6).map((itemId, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 bg-surface-4 rounded border border-divider/50 overflow-hidden relative"
                      >
                        {itemId > 0 ? (
                          <Image
                            src={getItemImageUrl(itemId)}
                            alt={`Item ${itemId}`}
                            fill
                            sizes="20px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-4/50"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 하단: 피해량 막대바 */}
                <div className="flex gap-1.5">
                  <DamageBar
                    label="피해"
                    percentage={damagePercentage}
                    value={`${(damage / 1000).toFixed(1)}k`}
                    color="red"
                  />
                  <DamageBar
                    label="받은 피해"
                    percentage={damageTakenPercentage}
                    value={`${(damageTaken / 1000).toFixed(1)}k`}
                    color="lime"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
