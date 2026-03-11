"use client";

import { GameTooltip } from "@/shared/ui/tooltip";
import type { Match, MatchDetail, ParticipantData } from "@/entities/match";
import { getChampionImageUrl } from "@/entities/champion";
import {
  extractItemIds,
  getItemImageUrl,
  getKDAColorClass,
  getPerkImageUrl,
} from "@/shared/lib/game";
import { parseRuneStyle, normalizeRunes } from "@/shared/lib/rune";
import { getStyleImageUrl } from "@/shared/lib/styles";
import { SummonerSpellImage, RuneImage } from "@/shared/ui/game";
import { normalizeRegion } from "@/entities/summoner";
import Image from "next/image";
import Link from "next/link";
import DamageBar from "./DamageBar";

interface MatchDetailOverviewProps {
  detail: MatchDetail;
  match: Match;
  isArena: boolean;
  blueTeam: ParticipantData[];
  redTeam: ParticipantData[];
  puuid: string | null;
  region?: string;
}

interface TeamStats {
  baron: number;
  dragon: number;
  turret: number;
  inhibitor: number;
}

export default function MatchDetailOverview({
  detail,
  match,
  isArena,
  blueTeam,
  redTeam,
  puuid,
  region = "kr",
}: MatchDetailOverviewProps) {
  const getSummonerUrl = (participant: ParticipantData) => {
    const normalizedRegion = normalizeRegion(region);
    const gameName = participant.riotIdGameName
      ? participant.riotIdTagline
        ? `${participant.riotIdGameName}-${participant.riotIdTagline}`
        : participant.riotIdGameName
      : participant.summonerName;
    return `/summoners/${normalizedRegion}/${encodeURIComponent(gameName)}`;
  };

  if (isArena) {
    const participants = detail.participantData || [];
    const hasValidPlacement = participants.some(p => p.placement > 0);

    const displayTeams: { team: ParticipantData[]; placement: number | null }[] = [];

    if (hasValidPlacement) {
      const placementGroups = participants.reduce((acc, p) => {
        const placement = p.placement || 999;
        if (!acc[placement]) acc[placement] = [];
        acc[placement].push(p);
        return acc;
      }, {} as Record<number, ParticipantData[]>);

      for (let i = 1; i <= 8; i++) {
        const team = placementGroups[i];
        if (team && team.length > 0) {
          displayTeams.push({ team, placement: i });
        }
      }
    } else {
      for (let i = 0; i < participants.length; i += 2) {
        const team = participants.slice(i, i + 2);
        if (team.length > 0) {
          displayTeams.push({ team, placement: null });
        }
      }
    }

    const maxDamageArena = Math.max(
      ...participants.map((p) => p.totalDamageDealtToChampions || 0)
    );
    const maxDamageTakenArena = Math.max(
      ...participants.map((p) => p.totalDamageTaken || 0)
    );

    return (
      <div className="space-y-1.5">
        {displayTeams.map(({ team, placement }, index) => {
          const isMyTeam = team.some((p) => p.puuid === puuid);
          return (
            <div
              key={placement ?? index}
              className={`p-1.5 rounded ${isMyTeam
                  ? "bg-loss/10 border border-loss/50"
                  : "bg-surface-4/30 border border-divider/50"
                }`}
            >
              <div className="text-on-surface text-[11px] font-semibold mb-1">
                {placement != null ? `${placement}위` : "-"}
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
                    participant.totalDamageTaken || 0;
                  const damagePercentage =
                    maxDamageArena > 0 ? (damage / maxDamageArena) * 100 : 0;
                  const damageTakenPercentage =
                    maxDamageTakenArena > 0
                      ? (damageTaken / maxDamageTakenArena) * 100
                      : 0;

                  return (
                    <div
                      key={participant.participantId}
                      className={`flex flex-col gap-0.5 p-1 rounded ${isMe
                          ? "bg-loss/30 border border-loss/60"
                          : "bg-surface-4/20"
                        }`}
                    >
                      {/* 상단: 기본 정보 */}
                      <div className="flex items-start gap-1.5">
                        <GameTooltip type="champion" id={participant.championName || ""} disabled={!participant.championName}>
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
                        </GameTooltip>
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
                            <GameTooltip key={idx} type="item" id={itemId} disabled={itemId <= 0}>
                              <div className="w-5 h-5 bg-surface-4 rounded border border-divider/50 overflow-hidden relative">
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
                            </GameTooltip>
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
            </div>
          );
        })}
      </div>
    );
  }

  // 팀별 오브젝트 처치 수 (teamInfoData에서 직접 가져옴)
  const blueTeamStats = {
    baron: detail.teamInfoData.blueTeam.baronKills,
    dragon: detail.teamInfoData.blueTeam.dragonKills,
    turret: detail.teamInfoData.blueTeam.towerKills,
    inhibitor: detail.teamInfoData.blueTeam.inhibitorKills,
  };

  const redTeamStats = {
    baron: detail.teamInfoData.redTeam.baronKills,
    dragon: detail.teamInfoData.redTeam.dragonKills,
    turret: detail.teamInfoData.redTeam.towerKills,
    inhibitor: detail.teamInfoData.redTeam.inhibitorKills,
  };

  const maxDamage = Math.max(
    ...blueTeam.map((p) => p.totalDamageDealtToChampions || 0),
    ...redTeam.map((p) => p.totalDamageDealtToChampions || 0)
  );
  const maxDamageTaken = Math.max(
    ...blueTeam.map((p) => p.totalDamageTaken || 0),
    ...redTeam.map((p) => p.totalDamageTaken || 0)
  );

  function renderDesktopTeam(
    team: ParticipantData[],
    teamColor: "blue" | "red",
    stats: TeamStats,
  ) {
    const teamLabel = teamColor === "blue" ? "블루팀" : "레드팀";
    const teamTextClass = teamColor === "blue" ? "text-team-blue" : "text-loss";
    const highlightBg = teamColor === "blue"
      ? "bg-team-blue/20 border border-team-blue/50"
      : "bg-team-red/20 border border-team-red/50";
    const dmgBarColor1 = teamColor === "blue" ? "orange" : "red";
    const dmgBarColor2 = teamColor === "blue" ? "blue" : "lime";

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className={`${teamTextClass} text-xs font-semibold`}>
            {teamLabel} {team.some((p) => p.win) ? "승리" : "패배"}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-on-surface-medium">
            <span>바론 {stats.baron}</span>
            <span>드래곤 {stats.dragon}</span>
            <span>타워 {stats.turret}</span>
            <span>억제기 {stats.inhibitor}</span>
          </div>
        </div>
        {team.map((participant) => {
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
          const damageTaken = participant.totalDamageTaken || 0;
          const damagePercentage =
            maxDamage > 0 ? (damage / maxDamage) * 100 : 0;
          const damageTakenPercentage =
            maxDamageTaken > 0 ? (damageTaken / maxDamageTaken) * 100 : 0;

          return (
            <div
              key={participant.participantId}
              className={`flex flex-col p-1 rounded ${isMe ? highlightBg : "bg-surface-4/30"
                }`}
            >
              <div className="flex items-start gap-1.5">
                <GameTooltip type="champion" id={participant.championName || ""} disabled={!participant.championName}>
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
                </GameTooltip>
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
                    <GameTooltip key={idx} type="item" id={itemId} disabled={itemId <= 0}>
                      <div className="w-5 h-5 bg-surface-4 rounded border border-divider/50 overflow-hidden relative">
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
                    </GameTooltip>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5">
                <DamageBar
                  label="피해"
                  percentage={damagePercentage}
                  value={`${(damage / 1000).toFixed(1)}k`}
                  color={dmgBarColor1}
                />
                <DamageBar
                  label="받은 피해"
                  percentage={damageTakenPercentage}
                  value={`${(damageTaken / 1000).toFixed(1)}k`}
                  color={dmgBarColor2}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderMobileTeam(
    team: ParticipantData[],
    teamColor: "blue" | "red",
    stats: TeamStats,
  ) {
    const teamLabel = teamColor === "blue" ? "블루팀" : "레드팀";
    const teamTextClass = teamColor === "blue" ? "text-team-blue" : "text-loss";
    const highlightBg = teamColor === "blue"
      ? "bg-team-blue/20 border border-team-blue/50"
      : "bg-team-red/20 border border-team-red/50";

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className={`${teamTextClass} text-xs font-semibold`}>
            {teamLabel} {team.some((p) => p.win) ? "승리" : "패배"}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-on-surface-medium">
            <span>바론 {stats.baron}</span>
            <span>드래곤 {stats.dragon}</span>
            <span>타워 {stats.turret}</span>
            <span>억제기 {stats.inhibitor}</span>
          </div>
        </div>
        {team.map((participant) => {
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
          const damageTaken = participant.totalDamageTaken || 0;
          const damagePercentage =
            maxDamage > 0 ? (damage / maxDamage) * 100 : 0;
          const damageTakenPercentage =
            maxDamageTaken > 0 ? (damageTaken / maxDamageTaken) * 100 : 0;

          // 룬 파싱
          const runeData = parseRuneStyle(participant.style);
          const normalized = runeData ? normalizeRunes(runeData) : null;
          const primaryRune = normalized?.primaryRunes[0] ?? 0;
          const secondaryTreeId = normalized?.secondaryTreeId ?? 0;

          return (
            <div
              key={participant.participantId}
              className={`flex items-center gap-1 px-1 rounded h-8 ${isMe ? highlightBg : "bg-surface-4/30"
                }`}
            >
              {/* Col 1: 챔피언 이미지 */}
              <GameTooltip type="champion" id={participant.championName || ""} disabled={!participant.championName}>
                <div className="w-8 h-8 bg-surface-8 rounded overflow-hidden relative shrink-0">
                  <Image
                    src={getChampionImageUrl(participant.championName || "")}
                    alt={participant.championName || "Unknown"}
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </GameTooltip>

              {/* Col 2: 스펠+룬 2x2 */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <div className="flex gap-0.5">
                  <SummonerSpellImage spellId={participant.summoner1Id} size="2xs" />
                  <RuneImage runeId={primaryRune} imageUrl={getPerkImageUrl(primaryRune)} size="2xs" />
                </div>
                <div className="flex gap-0.5">
                  <SummonerSpellImage spellId={participant.summoner2Id} size="2xs" />
                  <RuneImage runeId={secondaryTreeId} imageUrl={getStyleImageUrl(secondaryTreeId)} size="2xs" />
                </div>
              </div>

              {/* Col 3: 텍스트 정보 (2행) */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center">
                  <Link
                    href={getSummonerUrl(participant)}
                    prefetch={false}
                    onClick={(e) => e.stopPropagation()}
                    className="text-on-surface text-[11px] font-medium truncate flex-1 min-w-0 hover:text-team-blue hover:underline transition-colors"
                  >
                    {participant.riotIdGameName || participant.summonerName}
                  </Link>
                  <span className="text-on-surface-medium text-[10px] shrink-0 ml-1">
                    {participantTotalCS}({participantCsPerMin})
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-1 text-[10px] flex-1 min-w-0">
                    <span className="text-on-surface-medium truncate">
                      {participant.kills}/{participant.deaths}/{participant.assists}
                    </span>
                    <span className={`${getKDAColorClass(participantKDA)} shrink-0`}>
                      {participantKDA === "perfect" ? "perfect" : `${participantKDA}`}
                    </span>
                  </div>
                  <span className="text-gold text-[10px] shrink-0 ml-1">
                    {((participant.goldEarned || 0) / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              {/* Col 4: 피해량 막대바 (2행, 인라인) */}
              <div className="flex flex-col gap-0.5 shrink-0 w-24">
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1.5 bg-surface-8/50 rounded-full overflow-hidden">
                    <div className="h-full bg-warning/70 rounded-full" style={{ width: `${damagePercentage}%` }} />
                  </div>
                  <span className="text-warning text-[9px] w-7 text-right">{(damage / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1.5 bg-surface-8/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${damageTakenPercentage}%` }} />
                  </div>
                  <span className="text-primary text-[9px] w-7 text-right">{(damageTaken / 1000).toFixed(1)}k</span>
                </div>
              </div>

              {/* Col 5: 아이템 (2행: 3개 / 4개) */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <div className="flex gap-0.5">
                  {participantItems.slice(0, 3).map((itemId, idx) => (
                    <GameTooltip key={idx} type="item" id={itemId} disabled={itemId <= 0}>
                      <div className="w-[15px] h-[15px] bg-surface-4 rounded border border-divider/50 overflow-hidden relative">
                        {itemId > 0 ? (
                          <Image
                            src={getItemImageUrl(itemId)}
                            alt={`Item ${itemId}`}
                            fill
                            sizes="15px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-4/50"></div>
                        )}
                      </div>
                    </GameTooltip>
                  ))}
                </div>
                <div className="flex gap-0.5">
                  {participantItems.slice(3, 7).map((itemId, idx) => (
                    <GameTooltip key={idx + 3} type="item" id={itemId} disabled={itemId <= 0}>
                      <div className="w-[15px] h-[15px] bg-surface-4 rounded border border-divider/50 overflow-hidden relative">
                        {itemId > 0 ? (
                          <Image
                            src={getItemImageUrl(itemId)}
                            alt={`Item ${itemId}`}
                            fill
                            sizes="15px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-4/50"></div>
                        )}
                      </div>
                    </GameTooltip>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* 데스크탑 (기존 2컬럼 레이아웃) */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {renderDesktopTeam(blueTeam, "blue", blueTeamStats)}
        {renderDesktopTeam(redTeam, "red", redTeamStats)}
      </div>

      {/* 모바일 (1컬럼, 팀별 풀 너비) */}
      <div className="md:hidden space-y-4">
        {renderMobileTeam(blueTeam, "blue", blueTeamStats)}
        {renderMobileTeam(redTeam, "red", redTeamStats)}
      </div>
    </>
  );
}
