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

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const handleRefresh = async () => {
    if (!profileData?.puuid || !profileData?.platform) return;

    // 갱신 요청
    refresh(
      {
        platform: profileData.platform,
        puuid: profileData.puuid,
      },
      {
        onSuccess: async (response) => {
          // status가 PROGRESS일 경우에만 폴링 시작
          if (response.status !== "PROGRESS") {
            // FAILED나 SUCCESS면 폴링하지 않음
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
                // window.location.reload();
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

          // 즉시 한 번 확인
          await pollStatus();

          // 1초마다 폴링 (최대 10초)
          pollingIntervalRef.current = setInterval(pollStatus, 1000);
        },
      }
    );
  };

  if (isLoading || !profileData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* 첫 번째 열: 프로필 아이콘, 프로필 이름, 랭크 정보, 갱신 버튼, 승률 통계 */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* 프로필 아이콘과 이름, 갱신 버튼 */}
          <div className="flex items-start gap-3 md:gap-4">
            {/* 소환사 아이콘 */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 relative">
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
              <div className="absolute bottom-0 right-0 bg-black text-white text-[9px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded border border-gray-900">
                {profileData.summonerLevel}
              </div>
            </div>

            {/* 프로필 이름과 갱신 버튼 */}
            <div className="flex-1 flex flex-col gap-3 md:gap-4">
              {/* 프로필 이름 */}
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white break-words">
                  {profileData.gameName || summonerName}
                  {profileData.tagLine && (
                    <span className="text-gray-400 ml-1 md:ml-2 text-sm md:text-base">
                      #{profileData.tagLine}
                    </span>
                  )}
                </h1>
              </div>

              {/* 갱신 버튼 */}
              <div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isPolling}
                  className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed cursor-pointer text-white rounded-lg text-xs md:text-sm font-medium transition-colors"
                >
                  <RefreshCw
                    className={`w-3 h-3 md:w-4 md:h-4 ${
                      isRefreshing || isPolling ? "animate-spin" : ""
                    }`}
                  />
                  갱신
                </button>
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
