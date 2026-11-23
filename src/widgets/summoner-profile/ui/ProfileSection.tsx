"use client";

import {
  useSummonerProfile,
  parseSummonerName,
  getSummonerRenewalStatus,
} from "@/entities/summoner";
import type { SummonerProfile } from "@/entities/summoner";
import { getChampionSplashUrl } from "@/entities/champion";
import { useLeagueInfo } from "@/entities/league";
import type { LeagueInfoResponse } from "@/entities/league";
import { useChampionRanking } from "@/entities/match";
import { useSeasonStore } from "@/entities/season";
import { useRefreshSummonerData } from "@/features/summoner-refresh";
import { useGameDataStore } from "@/shared/model/game-data";
import { getProfileIconImageUrl } from "@/shared/lib/profile";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { RefreshCw } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  pickCoverLeague,
  pickMostChampion,
  resolveChampionAsset,
} from "../lib/profileCover";
import CoverTier from "./CoverTier";
import MostChampionBar, { MostChampionBarSkeleton } from "./MostChampionBar";

/** 테마의 바탕색(--md-surface-base)을 alpha% 만큼 남긴 색. 다크·라이트 모두에서 글자 대비를 지킨다. */
const surfaceAlpha = (alpha: number) =>
  `color-mix(in srgb, var(--md-surface-base) ${alpha}%, transparent)`;

/** 왼쪽 글자 영역은 진하게 덮고, 오른쪽으로 갈수록 일러스트가 드러나게 한다. */
const COVER_SCRIM = `linear-gradient(90deg, ${surfaceAlpha(95)} 0%, ${surfaceAlpha(80)} 34%, ${surfaceAlpha(12)} 72%, ${surfaceAlpha(30)} 100%)`;

interface ProfileSectionProps {
  summonerName: string; // gameName 형식: "name-tagLine"
  region?: string;
  initialData?: SummonerProfile; // 서버에서 미리 가져온 초기 데이터 (SSR용)
  initialLeagueData?: LeagueInfoResponse; // 서버에서 미리 가져온 리그 정보 (ProfileTabs 와 캐시 공유)
  onRefreshComplete?: () => void;
}

export default function ProfileSection({
  summonerName,
  region: propRegion,
  initialData,
  initialLeagueData,
  onRefreshComplete,
}: ProfileSectionProps) {
  const t = useTranslations("summoner.refresh");
  const format = useFormatter();
  // region이 prop으로 전달되지 않은 경우 파싱
  const parsed = propRegion
    ? { region: propRegion }
    : parseSummonerName(summonerName);

  const region = propRegion || parsed.region;

  const { data: profileData, isLoading } = useSummonerProfile(
    summonerName,
    region,
    { initialData }
  );

  const puuid = profileData?.puuid ?? "";
  const { data: leagueInfo } = useLeagueInfo(puuid, {
    initialData: initialLeagueData,
  });
  const latestSeason = useSeasonStore((s) => s.getLatestSeasonValue());
  const rankingQuery = useChampionRanking(puuid, latestSeason ?? "");
  const championData = useGameDataStore((s) => s.championData);

  const coverLeague = pickCoverLeague(leagueInfo);
  const most = pickMostChampion(rankingQuery.data);
  const mostAsset = most ? resolveChampionAsset(championData, most.stat) : null;
  // 시즌 목록은 앱 시작 후 클라이언트에서 받는다. 받기 전(SSR 포함)도 로딩으로 보고
  // 커버 높이를 미리 잡아 둔다 — 대부분의 소환사는 모스트 챔피언이 있다.
  const isMostPending = !latestSeason || rankingQuery.isLoading;
  // 모스트 챔피언이 없으면(이번 시즌 랭크 기록 없음) 일러스트·하단 바 없이 컴팩트 헤더로 접는다.
  const hasCover = isMostPending || most !== null;

  const splashUrl = mostAsset ? getChampionSplashUrl(mostAsset.assetId) : "";
  const [failedSplashUrl, setFailedSplashUrl] = useState<string | null>(null);
  const showSplash = splashUrl !== "" && failedSplashUrl !== splashUrl;

  const queryClient = useQueryClient();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshSummonerData();
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  // SSR/hydration 첫 렌더에서는 시간 계산을 하지 않기 위해 null로 시작한다.
  // 실제 시간 카운트는 마운트 후 클라이언트에서만 진행 (아래 useEffect에서 setNow).
  const [now, setNow] = useState<number | null>(null);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // 쿨다운 (2분) 계산 - 서버의 lastRevisionDateTime 기준
  // lastRevisionClickDateTime이 있을 때만 마운트 직후 now를 세팅하고
  // 1초마다 갱신해 재계산을 트리거한다. (실제 시간 카운트는 클라이언트 사이드에서만)
  useEffect(() => {
    if (!profileData?.lastRevisionClickDateTime) return;
    const updateNow = () => setNow(Date.now());
    updateNow(); // 마운트 직후 즉시 1회 계산
    const interval = setInterval(updateNow, 1000);
    return () => clearInterval(interval);
  }, [profileData?.lastRevisionClickDateTime]);

  // now + lastRevisionClickDateTime 기준으로 렌더 중 파생값 계산
  const { cooldownInfo, elapsedText } = useMemo<{
    cooldownInfo: { remainingSeconds: number } | null;
    elapsedText: string | null;
  }>(() => {
    // now === null 이면 아직 마운트 전(서버/hydration 첫 렌더)이므로 계산하지 않는다.
    if (!profileData?.lastRevisionClickDateTime || now === null) {
      return { cooldownInfo: null, elapsedText: null };
    }

    const raw = profileData.lastRevisionClickDateTime;
    const lastRevisionTime = dayjs(raw.replace(' ', 'T') + '+09:00').valueOf();
    const elapsed = now - lastRevisionTime;
    const remaining = Math.max(0, 120000 - elapsed);

    const cooldownInfo =
      remaining > 0 ? { remainingSeconds: Math.ceil(remaining / 1000) } : null;

    // 상대 시간 텍스트는 로케일별 포맷터에 위임한다.
    const elapsedText = format.relativeTime(lastRevisionTime, now);

    return { cooldownInfo, elapsedText };
  }, [profileData?.lastRevisionClickDateTime, now, format]);

  // 에러 메시지 5초 후 자동 소멸
  useEffect(() => {
    if (!refreshError) return;
    const timer = setTimeout(() => setRefreshError(null), 5000);
    return () => clearTimeout(timer);
  }, [refreshError]);

  // 갱신 버튼 비활성화 여부 확인
  const isRefreshDisabled = () => {
    if (isRefreshing || isPolling) return true;
    if (cooldownInfo !== null) return true;
    return false;
  };

  const handleRefresh = async () => {
    if (!profileData?.puuid) return;
    if (isRefreshDisabled()) return;

    // 갱신 요청
    refresh(
      { puuid: profileData.puuid },
      {
        onSuccess: async (response) => {
          // FAILED -> 쿨다운 (클릭 10초 이내, 또는 마지막 갱신 2분 이내 재요청)
          if (response.status === "FAILED") {
            setRefreshError(t("cooldownError"));
            return;
          }

          // SUCCESS -> 갱신 접수(이미 진행 중 포함), 폴링 시작
          setIsPolling(true);
          pollingStartTimeRef.current = Date.now();

          const stopPolling = () => {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setIsPolling(false);
            pollingStartTimeRef.current = null;
          };

          const pollStatus = async () => {
            // 최대 10초 경과 확인
            const elapsed =
              Date.now() - (pollingStartTimeRef.current || 0);
            if (elapsed >= 10000) {
              stopPolling();
              queryClient.invalidateQueries();
              onRefreshComplete?.();
              return;
            }

            try {
              const statusResponse = await getSummonerRenewalStatus(
                profileData.puuid
              );

              // 진행 중이 아니면 폴링 중지 -> 데이터 갱신
              if (statusResponse.status !== "PROGRESS") {
                stopPolling();
                queryClient.invalidateQueries();
                onRefreshComplete?.();
                return;
              }
            } catch (error) {
              // eslint-disable-next-line no-restricted-syntax -- 개발자 로그, 사용자 노출 아님
              console.error("갱신 상태 확인 중 오류:", error);
              stopPolling();
            }
          };

          // 0.2초 후 첫 번째 폴링 시작
          setTimeout(async () => {
            await pollStatus();
            // 첫 폴링에서 이미 완료된 경우 interval 생성 방지
            if (pollingStartTimeRef.current !== null) {
              pollingIntervalRef.current = setInterval(pollStatus, 1000);
            }
          }, 200);
        },
        onError: () => {
          setRefreshError(t("requestError"));
        },
      }
    );
  };

  if (isLoading || !profileData) {
    return (
      <div className="bg-surface-1 rounded-lg p-6 border border-divider">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-lg border border-divider bg-surface-1 ${hasCover ? "md:h-[290px]" : ""}`}
    >
      {/* 모스트 1 챔피언 스플래시 — 챔피언 이름은 하단 바가 전하므로 장식(alt="") */}
      {showSplash && (
        <>
          <Image
            src={splashUrl}
            alt=""
            fill
            sizes="(min-width: 1080px) 1016px, 100vw"
            className="object-cover object-[center_22%]"
            unoptimized
            loading="eager"
            fetchPriority="high"
            onError={() => setFailedSplashUrl(splashUrl)}
          />
          {/* 모바일은 글자가 가로 전체에 걸리므로 고르게, 데스크톱은 왼쪽만 진하게 덮는다. */}
          <div aria-hidden="true" className="absolute inset-0 bg-surface/80 md:hidden" />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden md:block"
            style={{ background: COVER_SCRIM }}
          />
        </>
      )}

      <div className="relative flex flex-col gap-4 md:gap-5 p-4 md:p-6">
        {/* 프로필 아이콘과 이름, 갱신 버튼 */}
        <div className="flex items-stretch gap-3 md:gap-4">
          {/* 소환사 아이콘 */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-2 rounded-lg overflow-hidden border-2 border-divider relative">
              {profileData.profileIconId ? (
                <Image
                  src={getProfileIconImageUrl(profileData.profileIconId)}
                  alt="Profile Icon"
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-3xl md:text-4xl flex items-center justify-center w-full h-full">
                  👤
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-surface text-on-surface text-[9px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded border border-divider">
              {profileData.summonerLevel}
            </div>
          </div>

          {/* 프로필 이름과 갱신 버튼 */}
          <div className="flex-1 flex flex-col gap-3 md:gap-4">
            {/* 프로필 이름 */}
            <div>
              <h1 className="text-lg md:text-xl font-bold text-on-surface break-words">
                <span className="whitespace-nowrap">
                  {profileData.gameName || summonerName}
                  {profileData.tagLine && (
                    <span className="text-on-surface-medium ml-1 md:ml-2 text-sm md:text-base">
                      #{profileData.tagLine}
                    </span>
                  )}
                </span>
              </h1>
            </div>

            {/* 갱신 버튼 */}
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={handleRefresh}
                disabled={isRefreshDisabled()}
                className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors min-w-[56px] ${isRefreshDisabled()
                  ? "bg-surface-4 text-on-surface-disabled opacity-60 cursor-not-allowed border border-divider"
                  : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 cursor-pointer"
                  }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing || isPolling ? "animate-spin" : ""
                    }`}
                />
                {isRefreshing || isPolling ? t("pending") : t("action")}
              </button>
              {cooldownInfo && (
                <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-medium whitespace-nowrap bg-surface-2 rounded-md border border-divider px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-medium animate-pulse" />
                  {cooldownInfo.remainingSeconds >= 60
                    ? t("retryInMinutes", {
                      minutes: Math.floor(cooldownInfo.remainingSeconds / 60),
                      seconds: cooldownInfo.remainingSeconds % 60,
                    })
                    : t("retryInSeconds", {
                      seconds: cooldownInfo.remainingSeconds,
                    })}
                </span>
              )}
              {!cooldownInfo && !isRefreshing && !isPolling && elapsedText && (
                <span className="text-xs text-on-surface-medium">
                  {t("lastRefresh", { time: elapsedText })}
                </span>
              )}
              {refreshError && (
                <span className="inline-flex items-center gap-1.5 text-xs text-error whitespace-nowrap">
                  {refreshError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 티어 — 솔로, 없으면 자유 랭크, 둘 다 없으면 UNRANKED */}
        <CoverTier league={coverLeague} />
      </div>

      {isMostPending ? (
        <MostChampionBarSkeleton />
      ) : most && mostAsset ? (
        <MostChampionBar most={most} championName={mostAsset.name} />
      ) : null}
    </div>
  );
}
