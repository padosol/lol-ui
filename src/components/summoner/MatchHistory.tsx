"use client";

import { useMatchIds } from "@/hooks/useSummoner";
import { getMatchDetail } from "@/lib/api/match";
import type { Match, MatchDetail } from "@/types/api";
import { getChampionImageUrl } from "@/utils/champion";
import { extractItemIds, getItemImageUrl, getKDAColorClass } from "@/utils/game";
import { getStyleImageUrl } from "@/utils/styles";
import { useQueries } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import ArenaTeamInfo from "./match/ArenaTeamInfo";
import MatchDetailInfo from "./match/MatchDetailInfo";
import TeamInfo from "./match/TeamInfo";
import MatchSummary from "./MatchSummary";

type GameModeFilter = "ALL" | "RANKED" | "FLEX" | "NORMAL" | "ARENA";

interface MatchHistoryProps {
  puuid?: string | null;
  region?: string;
  showTitle?: boolean;
}

export default function MatchHistory({
  puuid,
  region = "kr",
  showTitle = true,
}: MatchHistoryProps) {
  const [page, setPage] = useState(0);
  const [gameModeFilter, setGameModeFilter] = useState<GameModeFilter>("ALL");
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const limit = 20;

  // 매치 ID 리스트 가져오기
  const { data: matchIds = [], isLoading: isLoadingIds } = useMatchIds(
    puuid || "",
    undefined,
    page,
    region
  );

  // 각 매치 ID에 대한 상세 정보를 가져오기 (useQueries 사용)
  const matchDetailsQueriesConfig = useMemo(
    () =>
      matchIds.slice(0, limit).map((matchId) => ({
        queryKey: ["match", "detail", matchId] as const,
        queryFn: () => getMatchDetail(matchId),
        enabled: !!matchId && !!puuid,
        staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
      })),
    [matchIds, limit, puuid]
  );

  const matchDetailsQueries = useQueries({
    queries: matchDetailsQueriesConfig,
  });

  const isLoadingDetails = matchDetailsQueries.some((q) => q.isLoading);
  const isLoading = isLoadingIds || isLoadingDetails;

  // MatchDetail을 Match 타입으로 변환 (요약용)
  const allMatches = useMemo<Match[]>(() => {
    return matchDetailsQueries
      .map((query, index) => {
        const detail = query.data;
        if (!detail) return null;

        const matchId = matchIds[index];
        let myData = detail.myData;
        const gameInfo = detail.gameInfoData;

        // myData가 없으면 participantData에서 현재 사용자 찾기
        if (!myData && detail.participantData && puuid) {
          const found = detail.participantData.find((p) => p.puuid === puuid);
          if (!found) return null;
          myData = found;
        }

        // myData나 gameInfo가 없으면 null 반환
        if (!myData || !gameInfo) return null;

        // 날짜 포맷팅
        const gameDate = gameInfo.gameStartTimestamp
          ? new Date(gameInfo.gameStartTimestamp).toLocaleDateString("ko-KR")
          : "";

        return {
          id: matchId,
          champion: myData.championName || "Unknown",
          championIcon: getChampionImageUrl(myData.championName || ""),
          result: myData.win ? "WIN" : "LOSS",
          gameMode: gameInfo.gameMode || "CLASSIC",
          position:
            myData.teamPosition || myData.individualPosition || "UNKNOWN",
          kda: {
            kills: myData.kills || 0,
            deaths: myData.deaths || 0,
            assists: myData.assists || 0,
          },
          gameDuration: gameInfo.gameDuration || 0,
          gameDate,
          items: extractItemIds(myData.item || myData.itemSeq),
        } as Match;
      })
      .filter((match): match is Match => match !== null);
  }, [matchDetailsQueries, matchIds, puuid]);

  // MatchDetail 리스트 (상세 정보용)
  const matchDetails = useMemo(() => {
    return matchDetailsQueries
      .map((query) => query.data)
      .filter((detail): detail is MatchDetail => detail !== undefined);
  }, [matchDetailsQueries]);

  // 게임 모드 분류 함수들
  const isArenaMode = (gameMode: string, queueId?: number): boolean => {
    const arenaModes = ["ARENA", "CHERRY", "TFT"];
    const arenaQueueIds = [1700, 1710]; // 아레나 큐 ID
    return (
      arenaModes.some((mode) => gameMode.toUpperCase().includes(mode)) ||
      (queueId !== undefined && arenaQueueIds.includes(queueId))
    );
  };

  const isRankedMode = (queueId?: number): boolean => {
    // 솔로랭크 큐 ID
    const rankedQueueIds = [420]; // RANKED_SOLO_5x5
    return queueId !== undefined && rankedQueueIds.includes(queueId);
  };

  const isFlexMode = (queueId?: number): boolean => {
    // 자유랭크 큐 ID
    const flexQueueIds = [440]; // RANKED_FLEX_SR
    return queueId !== undefined && flexQueueIds.includes(queueId);
  };

  const isNormalMode = (gameMode: string, queueId?: number): boolean => {
    // 일반 게임 큐 ID
    const normalQueueIds = [400, 430]; // NORMAL_5v5_DRAFT, NORMAL_5v5_BLIND
    const normalModes = ["NORMAL", "CLASSIC"];
    return (
      (queueId !== undefined && normalQueueIds.includes(queueId)) ||
      normalModes.some((mode) => gameMode.toUpperCase().includes(mode))
    );
  };

  // 필터링된 매치들
  const filteredMatches = useMemo(() => {
    if (gameModeFilter === "ALL") return allMatches;
    return allMatches.filter((match) => {
      const detail = matchDetails.find((d) => {
        const matchId = match.id;
        return d.gameInfoData?.matchId === matchId;
      });
      if (!detail) return false;
      const gameMode = detail.gameInfoData?.gameMode || "";
      const queueId = detail.gameInfoData?.queueId;

      switch (gameModeFilter) {
        case "RANKED":
          return isRankedMode(queueId);
        case "FLEX":
          return isFlexMode(queueId);
        case "NORMAL":
          // 일반 모드는 queueId를 우선 확인하고, 랭크/자유랭크는 제외
          return (
            !isRankedMode(queueId) &&
            !isFlexMode(queueId) &&
            !isArenaMode(gameMode, queueId) &&
            isNormalMode(gameMode, queueId)
          );
        case "ARENA":
          return isArenaMode(gameMode, queueId);
        default:
          return true;
      }
    });
  }, [allMatches, matchDetails, gameModeFilter]);

  // 필터링된 매치 상세 정보 (매치 ID로 매칭)
  const filteredMatchDetails = useMemo(() => {
    const filteredMatchIds = new Set(filteredMatches.map((m) => m.id));
    return matchDetails
      .map((detail, index) => {
        const match = allMatches[index];
        if (!match || !filteredMatchIds.has(match.id)) return null;
        return { detail, match };
      })
      .filter(
        (item): item is { detail: MatchDetail; match: Match } => item !== null
      );
  }, [matchDetails, allMatches, filteredMatches]);

  const loadMoreMatches = useCallback(() => {
    if (!isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading]);

  // 다음 페이지가 있는지 확인 (현재 페이지의 데이터가 limit와 같으면 다음 페이지가 있을 가능성)
  const hasMore = matchIds.length === limit;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateKDA = (kda: {
    kills: number;
    deaths: number;
    assists: number;
  }) => {
    const total = kda.kills + kda.assists;
    const deaths = kda.deaths || 1;
    return (total / deaths).toFixed(2);
  };

  if (!puuid) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold text-white mb-2">최근 전적</h2>
        )}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-12 text-center">
          <div className="text-gray-400 text-lg">소환사 정보가 필요합니다.</div>
        </div>
      </div>
    );
  }

  if (isLoading && allMatches.length === 0) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold text-white mb-2">최근 전적</h2>
        )}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-400 text-sm">전적을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (allMatches.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold text-white mb-2">최근 전적</h2>
        )}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-12 text-center">
          <div className="text-gray-400 text-lg">전적 데이터가 없습니다.</div>
        </div>
      </div>
    );
  }

  // 게임 모드 이름 변환
  const getGameModeName = (gameMode: string, queueId?: number): string => {
    if (isArenaMode(gameMode, queueId)) {
      return "아레나";
    }

    // queueId를 우선적으로 확인하여 정확한 모드 구분
    if (queueId !== undefined) {
      if (isRankedMode(queueId)) {
        return "랭크";
      }
      if (isFlexMode(queueId)) {
        return "자유랭크";
      }
      if (isNormalMode(gameMode, queueId)) {
        return "일반";
      }
    }

    const modeMap: Record<string, string> = {
      CLASSIC: "일반",
      RANKED: "랭크",
      ARAM: "무작위 총력전",
      URF: "U.R.F.",
      TFT: "전략적 팀 전투",
    };
    return modeMap[gameMode] || gameMode;
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <h2 className="text-2xl font-bold text-white mb-2">최근 전적</h2>
      )}

      {/* 게임 모드 필터 탭 */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50 overflow-x-auto">
        <button
          onClick={() => setGameModeFilter("ALL")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${
            gameModeFilter === "ALL"
              ? "text-white bg-gray-700 shadow-lg shadow-gray-700/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setGameModeFilter("RANKED")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${
            gameModeFilter === "RANKED"
              ? "text-white bg-gray-700 shadow-lg shadow-gray-700/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          }`}
        >
          랭크
        </button>
        <button
          onClick={() => setGameModeFilter("FLEX")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${
            gameModeFilter === "FLEX"
              ? "text-white bg-gray-700 shadow-lg shadow-gray-700/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          }`}
        >
          자유랭크
        </button>
        <button
          onClick={() => setGameModeFilter("NORMAL")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${
            gameModeFilter === "NORMAL"
              ? "text-white bg-gray-700 shadow-lg shadow-gray-700/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          }`}
        >
          일반
        </button>
        <button
          onClick={() => setGameModeFilter("ARENA")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${
            gameModeFilter === "ARENA"
              ? "text-white bg-gray-700 shadow-lg shadow-gray-700/20"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          }`}
        >
          아레나
        </button>
      </div>

      {/* 매치 요약 */}
      <MatchSummary matches={filteredMatches} />

      <div className="space-y-3">
        {filteredMatchDetails.map(({ detail, match }) => {
          if (!match || !detail) return null;

          let myData = detail.myData;
          if (!myData && detail.participantData && puuid) {
            const found = detail.participantData.find((p) => p.puuid === puuid);
            if (!found) return null;
            myData = found;
          }
          if (!myData) return null;

          const items = extractItemIds(myData.item || myData.itemSeq);
          const gameInfo = detail.gameInfoData;
          const isArena = isArenaMode(
            gameInfo?.gameMode || "",
            gameInfo?.queueId
          );
          const gameModeName = getGameModeName(
            gameInfo?.gameMode || "",
            gameInfo?.queueId
          );

          // 아레나 모드는 팀 구조가 다름 (2명씩 팀)
          const teams = isArena
            ? detail.participantData?.reduce((acc, p) => {
                const teamKey = p.teamId || 0;
                if (!acc[teamKey]) acc[teamKey] = [];
                acc[teamKey].push(p);
                return acc;
              }, {} as Record<number, typeof detail.participantData>)
            : {
                100:
                  detail.participantData?.filter((p) => p.teamId === 100) || [],
                200:
                  detail.participantData?.filter((p) => p.teamId === 200) || [],
              };

          const blueTeam = teams[100] || [];
          const redTeam = teams[200] || [];

          // CS 계산
          const totalCS =
            (myData.totalMinionsKilled || 0) +
            (myData.neutralMinionsKilled || 0);
          const csPerMin =
            match.gameDuration > 0
              ? (totalCS / (match.gameDuration / 60)).toFixed(1)
              : "0.0";

          // 룬 및 스펠 정보 추출 (style 객체에서)
          let mainRuneId = 0;
          let subRuneStyleId = 0;
          let primaryRuneId = 0;
          let secondaryRuneId = 0;
          if (myData.style) {
            try {
              const style =
                typeof myData.style === "string"
                  ? JSON.parse(myData.style)
                  : myData.style;
              if (style?.styles && Array.isArray(style.styles)) {
                // 메인 룬 (첫 번째 스타일의 첫 번째 선택 룬)
                if (style.styles[0]?.selections?.[0]?.perk) {
                  mainRuneId = style.styles[0].selections[0].perk;
                }
                // 서브 룬 스타일 (두 번째 스타일)
                if (style.styles[1]?.style) {
                  subRuneStyleId = style.styles[1].style;
                }
              }
              // 스펠 ID 추출
              if (style?.primaryRuneId) {
                primaryRuneId = style.primaryRuneIds[0];
              }
              if (style?.secondaryRuneId) {
                secondaryRuneId = style.secondaryRuneId;
              }
            } catch {
              // 파싱 실패 시 무시
            }
          }

          // 승리/패배에 따른 색상 변수
          const borderColor =
            match.result === "WIN" ? "border-blue-500" : "border-red-500";
          const bgColor =
            match.result === "WIN" ? "bg-blue-500/10" : "bg-red-500/10";
          const textColor =
            match.result === "WIN" ? "text-blue-400" : "text-red-400";
          const shadowColor =
            match.result === "WIN"
              ? "hover:shadow-blue-500/10"
              : "hover:shadow-red-500/10";

          const isExpanded = expandedMatchId === match.id;

          return (
            <div
              key={match.id}
              className={`group relative flex flex-col w-full border-l-4 ${borderColor} ${bgColor} rounded-lg overflow-hidden transition-all hover:shadow-lg ${shadowColor} cursor-pointer`}
              onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
            >
              <div className="grid grid-cols-[120px_1fr_200px_30px] bg-gray-900/50 backdrop-blur-sm w-full">
                {/* 1. 게임 정보 섹션 */}
                <div className="flex flex-col items-start justify-start p-3 text-xs shrink-0 h-full gap-4">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className={`font-bold text-sm ${textColor}`}>
                      {gameModeName}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {match.gameDate}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-1">
                      <strong className={`text-base font-bold ${textColor}`}>
                        {isArena
                          ? `${myData.placement || 999}위`
                          : match.result === "WIN"
                          ? "승리"
                          : "패배"}
                      </strong>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {formatDuration(match.gameDuration)}
                    </span>
                  </div>
                </div>

                {/* 2. 챔피언+룬+아이템+KDA 정보 섹션 */}
                <div className="flex gap-4 py-2 pl-4 pr-3 min-w-0">
                  <div className="flex flex-1 gap-4 flex-col">
                    {/* 상단: 챔피언+스펠+룬, KDA, 통계 */}
                    <div className="flex gap-4 items-center">
                      {/* 챔피언 + 스펠 + 룬 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* 챔피언 아이콘 */}
                          <div className="relative">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-800 rounded-lg overflow-hidden relative border-2 border-gray-700/50 shadow-lg">
                              {match.championIcon ? (
                                <Image
                                  src={match.championIcon}
                                  alt={match.champion}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span className="text-2xl flex items-center justify-center w-full h-full">
                                  🎮
                                </span>
                              )}
                              {myData.champLevel > 0 && (
                                <span className="absolute bottom-0 right-0 flex items-center justify-center rounded-tl-lg bg-gray-900/90 text-[10px] font-bold text-white px-1.5 py-0.5">
                                  {myData.champLevel}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 스펠 + 룬 */}
                          <div className="flex flex-col justify-between">
                            {/* 스펠 */}
                            <div className="flex flex-col gap-1">
                              {primaryRuneId > 0 &&
                                (() => {
                                  const spellUrl =
                                    getStyleImageUrl(primaryRuneId);
                                  return spellUrl ? (
                                    <div className="w-7 h-7 bg-gray-800 rounded border border-gray-700/50 overflow-hidden relative shadow-sm flex items-center justify-center">
                                      <Image
                                        src={spellUrl}
                                        alt="Spell 1"
                                        width={28}
                                        height={28}
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                  ) : null;
                                })()}
                              {secondaryRuneId > 0 &&
                                (() => {
                                  const spellUrl =
                                    getStyleImageUrl(secondaryRuneId);
                                  return spellUrl ? (
                                    <div className="w-7 h-7 bg-gray-800 rounded border border-gray-700/50 overflow-hidden relative shadow-sm flex items-center justify-center">
                                      <Image
                                        src={spellUrl}
                                        alt="Spell 2"
                                        width={20}
                                        height={20}
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                  ) : null;
                                })()}
                            </div>
                            {/* 룬 */}
                            <div className="flex flex-col gap-1">
                              {mainRuneId > 0 && (
                                <div className="w-6 h-6 bg-gray-800 rounded-full border border-gray-700/50 overflow-hidden relative shadow-sm">
                                  <Image
                                    src={`https://static.mmrtr.shop/perks/${mainRuneId}.png`}
                                    alt="Main Rune"
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}
                              {subRuneStyleId > 0 && (
                                <div className="w-6 h-6 bg-gray-800 rounded-full border border-gray-700/50 overflow-hidden relative shadow-sm">
                                  <Image
                                    src={`https://static.mmrtr.shop/styles/${subRuneStyleId}.png`}
                                    alt="Sub Rune Style"
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* KDA + 통계 */}
                      <div className="flex flex-col items-start gap-0.5 min-w-[100px]">
                        <div className="flex items-center gap-1.5 text-base font-semibold -mt-1">
                          <span className="text-white">{match.kda.kills}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-red-400">
                            {match.kda.deaths}
                          </span>
                          <span className="text-gray-500">/</span>
                          <span className="text-white">
                            {match.kda.assists}
                          </span>
                        </div>
                        <div className="text-xs font-medium">
                          <span className={getKDAColorClass(calculateKDA(match.kda))}>
                            {calculateKDA(match.kda)}:1 평점
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs font-medium">
                          <span>
                            CS {totalCS}{" "}
                            <span className="text-gray-500">({csPerMin})</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 하단: 아이템 + 배지 */}
                    <div className="flex items-center gap-2">
                      {/* 아이템 */}
                      <div className="grid grid-cols-7 items-center gap-1">
                        {items.slice(0, 6).map((itemId, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 bg-gray-800 rounded border border-gray-700/50 overflow-hidden relative shadow-sm"
                          >
                            {itemId > 0 ? (
                              <Image
                                src={getItemImageUrl(itemId)}
                                alt={`Item ${itemId}`}
                                fill
                                sizes="26px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800/50"></div>
                            )}
                          </div>
                        ))}
                        {/* 와드 슬롯 */}
                        {items[6] > 0 && (
                          <div className="w-7 h-7 bg-gray-800 rounded-full border border-gray-700/50 overflow-hidden relative shadow-sm">
                            <Image
                              src={getItemImageUrl(items[6])}
                              alt="Ward"
                              fill
                              sizes="26px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 팀 정보 섹션 */}
                <div className="py-1 px-1.5 w-full shrink-0 flex flex-col items-end max-w-[200px] overflow-hidden">
                  {isArena ? (
                    <ArenaTeamInfo
                      participants={detail.participantData || []}
                      myPuuid={puuid}
                      myPlacement={myData.placement || 999}
                    />
                  ) : (
                    <TeamInfo
                      blueTeam={blueTeam}
                      redTeam={redTeam}
                      myPuuid={puuid}
                    />
                  )}
                </div>

                {/* 4. 화살표 섹션 */}
                <div className="flex items-end justify-center p-2">
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* 상세 정보 확장 뷰 */}
              {isExpanded && (
                <MatchDetailInfo
                  detail={detail}
                  match={match}
                  isArena={isArena}
                  blueTeam={blueTeam}
                  redTeam={redTeam}
                  puuid={puuid}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMoreMatches}
            disabled={isLoading}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed cursor-pointer text-white rounded-lg font-semibold transition-all shadow-lg shadow-gray-700/20 hover:shadow-gray-600/30 disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                전적을 불러오는 중...
              </span>
            ) : (
              "더 보기"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
