"use client";

import {
  useRefreshSummonerData,
  useSummonerProfile,
} from "@/hooks/useSummoner";
import { getSummonerRenewalStatus } from "@/lib/api/summoner";
import { getProfileIconImageUrl } from "@/utils/profile";
import { parseSummonerName } from "@/utils/summoner";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProfileSectionProps {
  summonerName: string; // gameName 형식: "name-tagLine"
  region?: string;
}

export default function ProfileSection({
  summonerName,
  region: propRegion,
}: ProfileSectionProps) {
  // region이 prop으로 전달되지 않은 경우 파싱
  const parsed = propRegion
    ? { region: propRegion }
    : parseSummonerName(summonerName);

  const region = propRegion || parsed.region;

  const { data: profileData, isLoading } = useSummonerProfile(
    summonerName,
    region
  );

  const { mutate: refresh, isPending: isRefreshing } = useRefreshSummonerData();
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // 남은 시간 계산 및 업데이트
  useEffect(() => {
    const updateRemainingTime = () => {
      if (!profileData) {
        setRemainingTime(null);
        return;
      }

      const now = Date.now();
      let minRemaining = Infinity;

      // 클릭 후 10초 제한 확인
      if (lastClickTime) {
        const elapsedSinceClick = now - lastClickTime;
        const remainingFromClick = 10000 - elapsedSinceClick;
        if (remainingFromClick > 0) {
          minRemaining = Math.min(minRemaining, remainingFromClick);
        }
      }

      // 갱신 완료 후 3분 제한 확인
      if (profileData.lastRevisionDateTime) {
        const lastRevisionTime = new Date(
          profileData.lastRevisionDateTime
        ).getTime();
        const elapsedSinceRevision = now - lastRevisionTime;
        const remainingFromRevision = 180000 - elapsedSinceRevision; // 3분 = 180000ms
        if (remainingFromRevision > 0) {
          minRemaining = Math.min(minRemaining, remainingFromRevision);
        }
      }

      if (minRemaining !== Infinity && minRemaining > 0) {
        setRemainingTime(Math.ceil(minRemaining / 1000)); // 초 단위로 변환
      } else {
        setRemainingTime(null);
      }
    };

    // 초기 업데이트
    updateRemainingTime();

    // 1초마다 업데이트
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [profileData, lastClickTime]);

  // 갱신 버튼 비활성화 여부 확인
  const isRefreshDisabled = () => {
    if (isRefreshing || isPolling) return true;
    if (remainingTime !== null && remainingTime > 0) return true;
    return false;
  };

  const handleRefresh = async () => {
    if (!profileData?.puuid) return;
    if (isRefreshDisabled()) return;

    const platform = profileData.platform || region;

    // 클릭 시간 기록
    setLastClickTime(Date.now());

    // 갱신 요청
    refresh(
      {
        platform,
        puuid: profileData.puuid,
      },
      {
        onSuccess: async (response) => {
          // status가 PROGRESS일 경우에만 폴링 시작
          if (response.status !== "PROGRESS") {
            // PROGRESS가 아니면 폴링하지 않음
            return;
          }

          // 폴링 시작
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
            const elapsed = Date.now() - (pollingStartTimeRef.current || 0);
            if (elapsed >= 10000) {
              stopPolling();
              return;
            }

            try {
              const response = await getSummonerRenewalStatus(
                profileData.puuid
              );

              console.log(response);
              // SUCCESS나 FAILED면 폴링 중지
              if (
                response.status === "SUCCESS" ||
                response.status === "FAILED"
              ) {
                stopPolling();
                // 페이지 새로고침
                window.location.reload();
                return;
              }
              // PROGRESS가 아니면 폴링 중지
              if (response.status !== "PROGRESS") {
                stopPolling();
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
            // 이후 1초마다 폴링 (최대 10초)
            pollingIntervalRef.current = setInterval(pollStatus, 1000);
          }, 200);
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
          <div className="flex items-start gap-3 md:gap-4">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshDisabled()}
                  className="flex items-center justify-center gap-1.5 px-2 py-1 bg-surface-8 hover:bg-surface-12 disabled:bg-surface-8 disabled:cursor-not-allowed cursor-pointer text-on-surface rounded-lg text-xs font-medium transition-colors w-fit"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${
                      isRefreshing || isPolling ? "animate-spin" : ""
                    }`}
                  />
                  갱신
                </button>
                {remainingTime !== null && remainingTime > 0 && (
                  <span className="text-[10px] text-on-surface-medium whitespace-nowrap">
                    {Math.floor(remainingTime / 60)}:
                    {String(remainingTime % 60).padStart(2, "0")} 후 가능
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
