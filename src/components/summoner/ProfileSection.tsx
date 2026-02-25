"use client";

import {
  useRefreshSummonerData,
  useSummonerProfile,
} from "@/hooks/useSummoner";
import { useQueryClient } from "@tanstack/react-query";
import { getSummonerRenewalStatus } from "@/lib/api/summoner";
import type { SummonerProfile } from "@/types/api";
import { getProfileIconImageUrl } from "@/utils/profile";
import { parseSummonerName } from "@/utils/summoner";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProfileSectionProps {
  summonerName: string; // gameName 형식: "name-tagLine"
  region?: string;
  initialData?: SummonerProfile; // 서버에서 미리 가져온 초기 데이터 (SSR용)
  onRefreshComplete?: () => void;
}

export default function ProfileSection({
  summonerName,
  region: propRegion,
  initialData,
  onRefreshComplete,
}: ProfileSectionProps) {
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

  const queryClient = useQueryClient();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshSummonerData();
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const [cooldownInfo, setCooldownInfo] = useState<{
    remainingSeconds: number;
  } | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

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
  useEffect(() => {
    const updateCooldownInfo = () => {
      if (!profileData?.lastRevisionDateTime) {
        setCooldownInfo(null);
        return;
      }

      const lastRevisionTime = new Date(profileData.lastRevisionDateTime).getTime();
      const elapsed = Date.now() - lastRevisionTime;
      const remaining = Math.max(0, 120000 - elapsed);

      if (remaining > 0) {
        setCooldownInfo({ remainingSeconds: Math.ceil(remaining / 1000) });
      } else {
        setCooldownInfo(null);
      }
    };

    updateCooldownInfo();
    const interval = setInterval(updateCooldownInfo, 1000);
    return () => clearInterval(interval);
  }, [profileData?.lastRevisionDateTime]);

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

    const platform = profileData.platform || region;

    // 갱신 요청
    refresh(
      {
        platform,
        puuid: profileData.puuid,
      },
      {
        onSuccess: async (response) => {
          // FAILED → 쿨다운 (3분 미만 재요청)
          if (response.status === "FAILED") {
            setRefreshError("잠시 후 다시 시도해주세요");
            return;
          }

          // SUCCESS → 갱신 진행중, 폴링 시작
          if (response.status === "SUCCESS") {
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

                // SUCCESS나 FAILED면 폴링 중지 → 데이터 갱신
                if (
                  statusResponse.status === "SUCCESS" ||
                  statusResponse.status === "FAILED"
                ) {
                  stopPolling();
                  queryClient.invalidateQueries();
                  onRefreshComplete?.();
                  return;
                }
              } catch (error) {
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

            return;
          }

          // 기타 상태 → 즉시 완료 처리
          queryClient.invalidateQueries();
          onRefreshComplete?.();
        },
        onError: () => {
          setRefreshError("갱신 요청에 실패했습니다");
        },
      }
    );
  };

  if (isLoading || !profileData) {
    return (
      <div className="bg-surface-4 rounded-lg p-6 border border-divider">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-4 rounded-lg p-4 md:p-6 border border-divider">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* 첫 번째 열: 프로필 아이콘, 프로필 이름, 랭크 정보, 갱신 버튼, 승률 통계 */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* 프로필 아이콘과 이름, 갱신 버튼 */}
          <div className="flex items-stretch gap-3 md:gap-4">
            {/* 소환사 아이콘 */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-8 rounded-lg overflow-hidden border-2 border-divider relative">
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
                  {profileData.gameName || summonerName}
                  {profileData.tagLine && (
                    <span className="text-on-surface-medium ml-1 md:ml-2 text-sm md:text-base">
                      #{profileData.tagLine}
                    </span>
                  )}
                </h1>
              </div>

              {/* 갱신 버튼 */}
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshDisabled()}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-fit ${
                    isRefreshDisabled()
                      ? "bg-surface-4 text-on-surface-disabled opacity-60 cursor-not-allowed border border-divider"
                      : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 cursor-pointer"
                  }`}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      isRefreshing || isPolling ? "animate-spin" : ""
                    }`}
                  />
                  {isRefreshing || isPolling ? "갱신 중..." : "갱신"}
                </button>
                {cooldownInfo && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-medium whitespace-nowrap bg-surface-6 rounded-md border border-divider px-2 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-surface-medium animate-pulse" />
                    {cooldownInfo.remainingSeconds >= 60
                      ? `${Math.floor(cooldownInfo.remainingSeconds / 60)}분 ${cooldownInfo.remainingSeconds % 60}초 후 재시도`
                      : `${cooldownInfo.remainingSeconds}초 후 재시도`}
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
        </div>

        {/* 두 번째 열: 비워둠 (추후 사용 예정) */}
        <div></div>

        {/* 세 번째 열: 비워둠 (추후 사용 예정) */}
        <div></div>
      </div>
    </div>
  );
}
