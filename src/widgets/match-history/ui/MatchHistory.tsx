"use client";

import { useDailyMatchCount, useSummonerMatches } from "@/entities/match";
import { useSeasonStore } from "@/entities/season";
import { useQueryClient } from "@tanstack/react-query";
import type { Match, MatchDetail } from "@/entities/match";
import { getChampionImageUrl } from "@/entities/champion";
import {
  extractItemIds,
  getItemImageUrl,
  getKDAColorClass,
  getPerkImageUrl,
  getSpellImageUrlAsync,
} from "@/shared/lib/game";
import { sortByPosition } from "@/shared/lib/position";
import { normalizeRunes, parseRuneStyle } from "@/shared/lib/rune";
import { getStyleImageUrl } from "@/shared/lib/styles";
import { getTierImageUrl, getTierName } from "@/shared/lib/tier";
import { GameTooltip } from "@/shared/ui/tooltip";
import { ArrowUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArenaTeamInfo, MatchDetailInfo, TeamInfo } from "@/widgets/match-detail";
import MatchSummary from "./MatchSummary";

type GameModeFilter = "ALL" | "RANKED" | "FLEX" | "NORMAL" | "ARENA" | "ARAM";

// 소환사 주문 이미지 컴포넌트 (비동기 로드)
function SummonerSpellImage({ spellId, small }: { spellId: number; small?: boolean }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const sizeClass = small ? "w-6 h-6" : "w-7 h-7";
  const imgSize = small ? 24 : 28;

  useEffect(() => {
    if (spellId > 0) {
      getSpellImageUrlAsync(spellId).then(setImageUrl).catch(() => {});
    }
  }, [spellId]);

  if (!imageUrl) {
    return null;
  }

  return (
    <GameTooltip type="spell" id={spellId}>
      <div className={`${sizeClass} bg-surface-4 rounded border border-divider/50 overflow-hidden relative shadow-sm flex items-center justify-center`}>
        <Image
          src={imageUrl}
          alt={`Summoner ${spellId}`}
          width={imgSize}
          height={imgSize}
          className="object-cover"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
    </GameTooltip>
  );
}

// 룬 이미지 컴포넌트 (소환사 주문과 동일한 스타일)
function RuneImage({ runeId, imageUrl, small }: { runeId: number; imageUrl: string; small?: boolean }) {
  const sizeClass = small ? "w-6 h-6" : "w-7 h-7";
  const imgSize = small ? 24 : 28;

  if (!imageUrl) {
    return null;
  }

  return (
    <GameTooltip type="rune" id={runeId}>
      <div className={`${sizeClass} bg-surface-4 rounded border border-divider/50 overflow-hidden relative shadow-sm flex items-center justify-center`}>
        <Image
          src={imageUrl}
          alt={`Rune ${runeId}`}
          width={imgSize}
          height={imgSize}
          className="object-cover"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
    </GameTooltip>
  );
}

interface MatchHistoryProps {
  puuid?: string | null;
  region?: string;
  showTitle?: boolean;
  refreshKey?: number;
}

export default function MatchHistory({
  puuid,
  region = "kr",
  showTitle = true,
  refreshKey,
}: MatchHistoryProps) {
  const queryClient = useQueryClient();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollTargetRef = useRef<Window | HTMLElement | null>(null);
  const [page, setPage] = useState(0);
  const [accMatchDetails, setAccMatchDetails] = useState<MatchDetail[]>([]);
  const [gameModeFilter, setGameModeFilter] = useState<GameModeFilter>("ALL");
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [showTopButton, setShowTopButton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 날짜별 게임수 조회
  const latestSeasonValue = useSeasonStore((s) => s.getLatestSeasonValue());

  const filterQueueId = useMemo(() => {
    switch (gameModeFilter) {
      case "RANKED": return 420;
      case "FLEX": return 440;
      case "NORMAL": return 430;
      case "ARENA": return 1700;
      case "ARAM": return 450;
      default: return undefined;
    }
  }, [gameModeFilter]);

  const { data: dailyCounts = [], isLoading: isDailyCountLoading } = useDailyMatchCount(
    region, puuid || "", latestSeasonValue ?? "", filterQueueId
  );

  // 소환사 매치 배치 조회
  const { data: matchesData, isLoading } = useSummonerMatches(
    puuid || "",
    filterQueueId,
    page,
    region,
    latestSeasonValue ?? undefined
  );

  // puuid/region/refreshKey 변경 시 누적 데이터 초기화 - 의도적인 상태 리셋
  // 최초 마운트 시에는 useSummonerMatches의 자동 fetch와 중복되지 않도록 건너뜀
  const isFirstMount = useRef(true);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(0);
    setAccMatchDetails([]);
    setExpandedMatchId(null);
    setIsLoadingMore(false);
    queryClient.resetQueries({ queryKey: ["summoner", "matches", puuid] });
  }, [puuid, region, refreshKey, queryClient]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // gameModeFilter 변경 시 누적 데이터 초기화 - API에서 새 queueId로 재조회
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPage(0);
    setAccMatchDetails([]);
    setExpandedMatchId(null);
    setIsLoadingMore(false);
  }, [gameModeFilter]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 페이지별 응답을 누적(append)해서 유지 - 외부 데이터 동기화
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsLoadingMore(false);
    const newDetails = matchesData?.content;
    if (!newDetails || newDetails.length === 0) return;

    setAccMatchDetails((prev) => {
      const next = [...prev];
      const existing = new Set(prev.map((d) => d.gameInfoData?.matchId));
      for (const detail of newDetails) {
        const matchId = detail.gameInfoData?.matchId;
        if (matchId && !existing.has(matchId)) {
          existing.add(matchId);
          next.push(detail);
        }
      }
      return next;
    });
  }, [matchesData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 스크롤 위치에 따라 Top 버튼 표시/숨김
  useEffect(() => {
    const isScrollableEl = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const canScroll =
        overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay";
      return canScroll && el.scrollHeight > el.clientHeight + 1;
    };

    const getScrollParent = (el: HTMLElement | null): Window | HTMLElement => {
      if (!el) return window;

      // 루트 자신이 스크롤 컨테이너인 경우도 고려
      if (isScrollableEl(el)) return el;

      let parent: HTMLElement | null = el.parentElement;
      while (parent) {
        if (isScrollableEl(parent)) return parent;
        parent = parent.parentElement;
      }

      return window;
    };

    const scrollTarget = getScrollParent(rootRef.current);
    scrollTargetRef.current = scrollTarget;

    const getScrollTop = () =>
      scrollTarget === window
        ? window.scrollY || document.documentElement.scrollTop || 0
        : (scrollTarget as HTMLElement).scrollTop;

    const onScroll = () => {
      // 너무 민감하지 않게 약간 내려갔을 때부터 표시
      setShowTopButton(getScrollTop() > 200);
    };

    onScroll();

    if (scrollTarget === window) {
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    (scrollTarget as HTMLElement).addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () =>
      (scrollTarget as HTMLElement).removeEventListener("scroll", onScroll);
  }, [accMatchDetails.length]);

  const scrollToTop = useCallback(() => {
    const target = scrollTargetRef.current;

    if (!target || target === window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    target.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 모든 매치가 로딩되었는지 확인
  const allMatchesLoaded = accMatchDetails.length > 0 && !isLoading;

  // MatchDetail을 Match 타입으로 변환 (요약용)
  const allMatches = useMemo<Match[]>(() => {
    return accMatchDetails
      .map((detail) => {
        const gameInfo = detail.gameInfoData;
        const matchId = gameInfo?.matchId;
        if (!matchId) return null;

        let myData = detail.myData;

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

        const gameDuration = gameInfo.gameDuration || 0;
        // 5분 미만이면 다시하기로 간주 (5분 = 300초)
        const isRemake = gameDuration < 300;

        return {
          id: matchId,
          champion: myData.championName || "Unknown",
          championIcon: getChampionImageUrl(myData.championName || ""),
          result: isRemake ? "REMAKE" : myData.win ? "WIN" : "LOSS",
          gameMode: gameInfo.gameMode || "CLASSIC",
          position:
            myData.teamPosition || myData.individualPosition || "UNKNOWN",
          kda: {
            kills: myData.kills || 0,
            deaths: myData.deaths || 0,
            assists: myData.assists || 0,
          },
          gameDuration,
          gameDate,
          gameTimestamp: gameInfo.gameStartTimestamp || 0,
          items: extractItemIds(myData.item || myData.itemSeq),
        } as Match;
      })
      .filter((match): match is Match => match !== null);
  }, [accMatchDetails, puuid]);

  // MatchDetail 리스트 (상세 정보용)
  const matchDetails = accMatchDetails;

  // 매치 상세 정보 (매치 ID로 매칭)
  const filteredMatchDetails = useMemo(() => {
    const allMatchesMap = new Map(allMatches.map((m) => [m.id, m]));
    return matchDetails
      .map((detail) => {
        const matchId = detail.gameInfoData?.matchId;
        if (!matchId) return null;
        const match = allMatchesMap.get(matchId);
        if (!match) return null;
        return { detail, match };
      })
      .filter(
        (item): item is { detail: MatchDetail; match: Match } => item !== null
      );
  }, [matchDetails, allMatches]);

  const loadMoreMatches = useCallback(() => {
    if (!isLoading && !isLoadingMore && (matchesData?.hasNext || false)) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [isLoading, isLoadingMore, matchesData?.hasNext]);

  // 다음 페이지가 있는지 확인
  const hasMore = matchesData?.hasNext || false;

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
    if (kda.deaths === 0) {
      return "perfect";
    }
    const total = kda.kills + kda.assists;
    const deaths = kda.deaths || 1;
    return (total / deaths).toFixed(2);
  };

  if (!puuid) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold text-on-surface mb-2">최근 전적</h2>
        )}
        <div className="bg-surface-4/50 rounded-lg border border-divider/50 p-12 text-center">
          <div className="text-on-surface-medium text-lg">소환사 정보가 필요합니다.</div>
        </div>
      </div>
    );
  }

  // 게임 모드 이름 변환
  const getGameModeName = (gameMode: string, queueId?: number): string => {
    if (queueId !== undefined) {
      const queueMap: Record<number, string> = {
        420: "랭크",
        440: "자유랭크",
        400: "일반",
        430: "일반",
        450: "무작위 총력전",
        100: "무작위 총력전",
        1700: "아레나",
        1710: "아레나",
      };
      if (queueMap[queueId]) return queueMap[queueId];
    }

    const modeMap: Record<string, string> = {
      CLASSIC: "일반",
      RANKED: "랭크",
      ARAM: "무작위 총력전",
      URF: "U.R.F.",
      TFT: "전략적 팀 전투",
      ARENA: "아레나",
      CHERRY: "아레나",
      SWIFTPLAY: "신속",
    };
    return modeMap[gameMode] || gameMode;
  };

  return (
    <div ref={rootRef} className="space-y-4">
      {showTitle && (
        <h2 className="text-2xl font-bold text-on-surface mb-2">최근 전적</h2>
      )}

      {/* 게임 모드 필터 탭 */}
      <div className="flex gap-1 mb-4 bg-surface-2/50 rounded-lg p-1 border border-divider/50 overflow-x-auto">
        <button
          onClick={() => setGameModeFilter("ALL")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${gameModeFilter === "ALL"
            ? "text-on-surface bg-surface-8 shadow-lg shadow-surface-8/20"
            : "text-on-surface-medium hover:text-on-surface hover:bg-surface-8/50"
            }`}
        >
          전체
        </button>
        <button
          onClick={() => setGameModeFilter("RANKED")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${gameModeFilter === "RANKED"
            ? "text-on-surface bg-surface-8 shadow-lg shadow-surface-8/20"
            : "text-on-surface-medium hover:text-on-surface hover:bg-surface-8/50"
            }`}
        >
          솔로랭크
        </button>
        <button
          onClick={() => setGameModeFilter("FLEX")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${gameModeFilter === "FLEX"
            ? "text-on-surface bg-surface-8 shadow-lg shadow-surface-8/20"
            : "text-on-surface-medium hover:text-on-surface hover:bg-surface-8/50"
            }`}
        >
          자유랭크
        </button>
        <button
          onClick={() => setGameModeFilter("NORMAL")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${gameModeFilter === "NORMAL"
            ? "text-on-surface bg-surface-8 shadow-lg shadow-surface-8/20"
            : "text-on-surface-medium hover:text-on-surface hover:bg-surface-8/50"
            }`}
        >
          일반
        </button>
        <button
          onClick={() => setGameModeFilter("ARENA")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${gameModeFilter === "ARENA"
            ? "text-on-surface bg-surface-8 shadow-lg shadow-surface-8/20"
            : "text-on-surface-medium hover:text-on-surface hover:bg-surface-8/50"
            }`}
        >
          아레나
        </button>
        <button
          onClick={() => setGameModeFilter("ARAM")}
          className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md cursor-pointer ${gameModeFilter === "ARAM"
            ? "text-on-surface bg-surface-8 shadow-lg shadow-surface-8/20"
            : "text-on-surface-medium hover:text-on-surface hover:bg-surface-8/50"
            }`}
        >
          무작위총력전
        </button>
      </div>

      {/* 매치 요약 */}
      <MatchSummary
        matches={allMatchesLoaded ? allMatches : []}
        dailyCounts={dailyCounts}
        isDailyCountLoading={isDailyCountLoading}
      />

      {allMatches.length === 0 && (isLoading || (matchesData?.content?.length ?? 0) > 0) ? (
        <div className="bg-surface-4/50 rounded-lg border border-divider/50 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-on-surface-medium text-sm">전적을 불러오는 중...</div>
          </div>
        </div>
      ) : allMatches.length === 0 && !isLoading && !matchesData?.content?.length ? (
        <div className="bg-surface-4/50 rounded-lg border border-divider/50 p-12 text-center">
          <div className="text-on-surface-medium text-lg">전적 데이터가 없습니다.</div>
        </div>
      ) : (
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
            const arenaQueueIds = [1700, 1710];
            const arenaModes = ["ARENA", "CHERRY", "TFT"];
            const isArena =
              (gameInfo?.queueId !== undefined && arenaQueueIds.includes(gameInfo.queueId)) ||
              arenaModes.some((mode) => (gameInfo?.gameMode || "").toUpperCase().includes(mode));
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

            const blueTeam = sortByPosition(teams[100] || []);
            const redTeam = sortByPosition(teams[200] || []);

            // CS 계산
            const totalCS =
              (myData.totalMinionsKilled || 0) +
              (myData.neutralMinionsKilled || 0);
            const csPerMin =
              match.gameDuration > 0
                ? (totalCS / (match.gameDuration / 60)).toFixed(1)
                : "0.0";

            // 룬 정보 추출 (style 객체에서)
            const parsedRunes = normalizeRunes(parseRuneStyle(myData.style));
            const mainRuneId = parsedRunes?.primaryRunes[0] ?? 0;
            const subRuneStyleId = parsedRunes?.secondaryTreeId ?? 0;

            // 승리/패배/다시하기에 따른 색상 변수 (Material Design 2)
            const isRemake = match.result === "REMAKE";
            const borderColor = isRemake
              ? "border-on-surface-disabled"
              : match.result === "WIN"
                ? "border-win"
                : "border-loss";
            const bgColor = isRemake
              ? "bg-surface-8/50"
              : match.result === "WIN"
                ? "bg-win/10"
                : "bg-loss/10";
            const textColor = isRemake
              ? "text-on-surface-disabled"
              : match.result === "WIN"
                ? "text-win"
                : "text-loss";
            const shadowColor = isRemake
              ? "hover:shadow-surface-8/10"
              : match.result === "WIN"
                ? "hover:shadow-win/10"
                : "hover:shadow-loss/10";
            const arrowBgColor = isRemake
              ? "bg-surface-8 hover:bg-surface-12"
              : match.result === "WIN"
                ? "bg-win/10 hover:bg-win/20"
                : "bg-loss/10 hover:bg-loss/20";

            const isExpanded = expandedMatchId === match.id;

            return (
              <div
                key={match.id}
                className={`group relative flex flex-col w-full border-l-4 ${borderColor} ${bgColor} rounded-lg overflow-hidden transition-all hover:shadow-lg ${shadowColor}`}
              >
                {/* 데스크톱 레이아웃 (md 이상) */}
                <div className="hidden md:grid grid-cols-[90px_250px_90px_1fr_30px] bg-surface-1/50 backdrop-blur-sm w-full">
                  {/* 1. 게임 정보 섹션 */}
                  <div className="flex flex-col items-start justify-between p-2 text-xs shrink-0 h-full gap-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={`font-bold text-sm ${textColor}`}>
                        {gameModeName}
                      </span>
                      <span className="text-on-surface-medium text-xs">
                        {match.gameDate}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <div className="flex items-center gap-1">
                        <strong className={`text-sm font-bold ${textColor}`}>
                          {isArena
                            ? (myData.placement > 0 ? `${myData.placement}위` : "???")
                            : match.result === "REMAKE"
                              ? "다시하기"
                              : match.result === "WIN"
                                ? "승리"
                                : "패배"}
                        </strong>
                      </div>
                      <span className="text-on-surface-medium text-xs">
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
                            <GameTooltip type="champion" id={match.champion}>
                              <div className="relative">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-4 rounded-lg overflow-hidden relative border-2 border-divider/50 shadow-lg">
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
                                    <span className="absolute bottom-0 right-0 flex items-center justify-center rounded-tl-lg bg-surface-1/90 text-[10px] font-bold text-on-surface px-1.5 py-0.5">
                                      {myData.champLevel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </GameTooltip>

                            {/* 소환사 주문 + 룬 */}
                            <div className="flex flex-row gap-1 items-start">
                              {/* 소환사 주문 */}
                              <div className="flex flex-col gap-1">
                                {myData.summoner1Id > 0 && (
                                  <SummonerSpellImage
                                    spellId={myData.summoner1Id}
                                  />
                                )}
                                {myData.summoner2Id > 0 && (
                                  <SummonerSpellImage
                                    spellId={myData.summoner2Id}
                                  />
                                )}
                              </div>
                              {/* 룬 */}
                              <div className="flex flex-col gap-1">
                                {mainRuneId > 0 && (
                                  <RuneImage
                                    runeId={mainRuneId}
                                    imageUrl={getPerkImageUrl(mainRuneId)}
                                  />
                                )}
                                {subRuneStyleId > 0 && (
                                  <RuneImage
                                    runeId={subRuneStyleId}
                                    imageUrl={getStyleImageUrl(subRuneStyleId)}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* KDA + 통계 */}
                        <div className="flex flex-col items-start gap-0.5 min-w-[100px]">
                          <div className="flex items-center gap-1.5 text-base font-semibold -mt-1">
                            <span className="text-on-surface">{match.kda.kills}</span>
                            <span className="text-on-surface-disabled">/</span>
                            <span className="text-loss">
                              {match.kda.deaths}
                            </span>
                            <span className="text-on-surface-disabled">/</span>
                            <span className="text-on-surface">
                              {match.kda.assists}
                            </span>
                          </div>
                          <div className="text-xs font-medium">
                            <span
                              className={getKDAColorClass(
                                calculateKDA(match.kda)
                              )}
                            >
                              {calculateKDA(match.kda) === "perfect"
                                ? "perfect"
                                : `${calculateKDA(match.kda)}:1 평점`}
                            </span>
                          </div>
                          <div className="text-on-surface-medium text-xs font-medium">
                            <span>
                              CS {totalCS}{" "}
                              <span className="text-on-surface-disabled">({csPerMin})</span>
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* 하단: 아이템 + 배지 */}
                      <div className="flex items-center gap-2">
                        {/* 아이템 */}
                        <div className="grid grid-cols-7 items-center gap-1">
                          {items.slice(0, 6).map((itemId, idx) => (
                            <GameTooltip key={idx} type="item" id={itemId} disabled={itemId <= 0}>
                              <div className="w-7 h-7 bg-surface-4 rounded border border-divider/50 overflow-hidden relative shadow-sm">
                                <Image
                                  src={getItemImageUrl(itemId)}
                                  alt={`Item ${itemId}`}
                                  fill
                                  sizes="26px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            </GameTooltip>
                          ))}
                          {/* 와드 슬롯 */}
                          {items[6] > 0 && (
                            <GameTooltip type="item" id={items[6]}>
                              <div className="w-7 h-7 bg-surface-4 rounded-full border border-divider/50 overflow-hidden relative shadow-sm">
                                <Image
                                  src={getItemImageUrl(items[6])}
                                  alt="Ward"
                                  fill
                                  sizes="26px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            </GameTooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. 평균 티어 섹션 */}
                  <div className="flex flex-col items-center justify-start py-2 w-[80px]">
                    {gameInfo?.averageTier != null ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-on-surface-disabled">평균</span>
                        {getTierImageUrl(gameInfo.averageTier) && (
                          <Image
                            src={getTierImageUrl(gameInfo.averageTier)}
                            alt={getTierName(gameInfo.averageTier)}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                          />
                        )}
                        <span className="text-[10px] text-on-surface-medium font-medium leading-tight text-center">
                          {getTierName(gameInfo.averageTier)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-on-surface-disabled">평균</span>
                        <span className="text-[10px] text-on-surface-disabled">-</span>
                      </div>
                    )}
                    {/* 멀티킬 배지 - 가장 높은 등급만 표시 */}
                    {myData.pentaKills > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold leading-none mt-1">Penta</span>
                    ) : myData.quadraKills > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[9px] font-bold leading-none mt-1">Quadra</span>
                    ) : myData.tripleKills > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold leading-none mt-1">Triple</span>
                    ) : myData.doubleKills > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold leading-none mt-1">Double</span>
                    ) : null}
                  </div>

                  {/* 4. 팀 정보 섹션 */}
                  <div className="py-1 px-1.5 w-full shrink-0 flex flex-col items-end max-w-[200px] overflow-hidden">
                    {isArena ? (
                      <ArenaTeamInfo
                        participants={detail.participantData || []}
                        myPuuid={puuid}
                        myPlacement={myData.placement || 0}
                        region={region}
                      />
                    ) : (
                      <TeamInfo
                        blueTeam={blueTeam}
                        redTeam={redTeam}
                        myPuuid={puuid}
                        region={region}
                      />
                    )}
                  </div>

                  {/* 5. 화살표 섹션 */}
                  <div
                    className={`flex items-end justify-center p-2 cursor-pointer ${arrowBgColor} transition-colors`}
                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-on-surface-medium transition-transform ${isExpanded ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>

                {/* 모바일 레이아웃 (md 미만) */}
                <div className="md:hidden bg-surface-1/50 backdrop-blur-sm w-full p-2.5">
                  {/* Row 1: 승패 + 게임타입 + 시간 | 날짜 + 화살표 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${textColor}`}>
                        {isArena
                          ? (myData.placement > 0 ? `${myData.placement}위` : "???")
                          : match.result === "REMAKE"
                            ? "다시하기"
                            : match.result === "WIN"
                              ? "승리"
                              : "패배"}
                      </span>
                      <span className={`text-xs ${textColor}`}>{gameModeName}</span>
                      <span className="text-on-surface-medium text-xs">
                        {formatDuration(match.gameDuration)}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${arrowBgColor} rounded px-1.5 py-0.5 transition-colors`}
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                    >
                      <span className="text-on-surface-medium text-xs">{match.gameDate}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-on-surface-medium transition-transform ${isExpanded ? "rotate-180" : ""
                          }`}
                      />
                    </div>
                  </div>

                  {/* Row 2: 챔피언+스펠+룬 | KDA | 아이템 */}
                  <div className="flex items-center gap-2">
                    {/* 왼쪽: 챔프 + 스펠 + 룬 */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* 챔피언 아이콘 */}
                      <GameTooltip type="champion" id={match.champion}>
                        <div className="relative">
                          <div className="w-10 h-10 bg-surface-4 rounded-lg overflow-hidden relative border border-divider/50 shadow-sm">
                            {match.championIcon ? (
                              <Image
                                src={match.championIcon}
                                alt={match.champion}
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-lg flex items-center justify-center w-full h-full">
                                🎮
                              </span>
                            )}
                            {myData.champLevel > 0 && (
                              <span className="absolute bottom-0 right-0 flex items-center justify-center rounded-tl bg-surface-1/90 text-[8px] font-bold text-on-surface px-1 py-0">
                                {myData.champLevel}
                              </span>
                            )}
                          </div>
                        </div>
                      </GameTooltip>
                      {/* 소환사 주문 */}
                      <div className="flex flex-col gap-0.5">
                        {myData.summoner1Id > 0 && (
                          <SummonerSpellImage spellId={myData.summoner1Id} small />
                        )}
                        {myData.summoner2Id > 0 && (
                          <SummonerSpellImage spellId={myData.summoner2Id} small />
                        )}
                      </div>
                      {/* 룬 */}
                      <div className="flex flex-col gap-0.5">
                        {mainRuneId > 0 && (
                          <RuneImage
                            runeId={mainRuneId}
                            imageUrl={getPerkImageUrl(mainRuneId)}
                            small
                          />
                        )}
                        {subRuneStyleId > 0 && (
                          <RuneImage
                            runeId={subRuneStyleId}
                            imageUrl={getStyleImageUrl(subRuneStyleId)}
                            small
                          />
                        )}
                      </div>
                    </div>

                    {/* 중앙: KDA */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <span className="text-on-surface">{match.kda.kills}</span>
                        <span className="text-on-surface-disabled">/</span>
                        <span className="text-loss">{match.kda.deaths}</span>
                        <span className="text-on-surface-disabled">/</span>
                        <span className="text-on-surface">{match.kda.assists}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium">
                        <span className={getKDAColorClass(calculateKDA(match.kda))}>
                          {calculateKDA(match.kda) === "perfect"
                            ? "perfect"
                            : `${calculateKDA(match.kda)}:1 평점`}
                        </span>
                        {gameInfo?.averageTier != null && getTierImageUrl(gameInfo.averageTier) && (
                          <span className="flex items-center gap-0.5 text-on-surface-medium">
                            <Image
                              src={getTierImageUrl(gameInfo.averageTier)}
                              alt={getTierName(gameInfo.averageTier)}
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                            <span className="text-[10px]">{getTierName(gameInfo.averageTier)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 오른쪽: 아이템 */}
                    <div className="grid grid-cols-4 gap-0.5 shrink-0">
                      {items.slice(0, 6).map((itemId, idx) => (
                        <GameTooltip key={idx} type="item" id={itemId} disabled={itemId <= 0}>
                          <div className="w-5 h-5 bg-surface-4 rounded border border-divider/50 overflow-hidden relative">
                            <Image
                              src={getItemImageUrl(itemId)}
                              alt={`Item ${itemId}`}
                              fill
                              sizes="20px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </GameTooltip>
                      ))}
                      {items[6] > 0 && (
                        <GameTooltip type="item" id={items[6]}>
                          <div className="w-5 h-5 bg-surface-4 rounded-full border border-divider/50 overflow-hidden relative">
                            <Image
                              src={getItemImageUrl(items[6])}
                              alt="Ward"
                              fill
                              sizes="20px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </GameTooltip>
                      )}
                    </div>
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
      )}

      {/* 더 보기 버튼 */}
      {(hasMore || isLoadingMore) && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMoreMatches}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-surface-8 hover:bg-surface-12 disabled:bg-surface-8 disabled:cursor-not-allowed cursor-pointer text-on-surface rounded-lg font-semibold transition-all shadow-lg shadow-surface-8/20 hover:shadow-surface-12/30 disabled:shadow-none"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-on-surface-disabled border-t-on-surface rounded-full animate-spin"></div>
                전적을 불러오는 중...
              </span>
            ) : (
              "더 보기"
            )}
          </button>
        </div>
      )}

      {/* Top 버튼 */}
      {showTopButton && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="맨 위로"
          className="fixed bottom-6 right-10 z-50 w-11 h-11 rounded-full bg-surface-4/90 hover:bg-surface-8 text-on-surface border border-divider/60 shadow-lg backdrop-blur flex items-center justify-center transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
