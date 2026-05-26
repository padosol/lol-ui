"use client";

import {
  useChampionRotate,
  getChampionImageUrl,
  useChampionsByIds,
} from "@/entities/champion";
import Image from "next/image";

export default function DesktopAppSection() {
  const { data: rotationData, isLoading } = useChampionRotate("kr");
  const champions = useChampionsByIds(rotationData?.freeChampionIds ?? []);

  const hasFreeChampions =
    !!rotationData?.freeChampionIds &&
    rotationData.freeChampionIds.length > 0;

  // rotation 쿼리가 로딩 중이거나, 무료 챔피언 ID는 있는데
  // 아직 챔피언 데이터가 파생되지 않았으면 로딩 중
  const isChampionsLoading =
    !isLoading && hasFreeChampions && champions.length === 0;

  return (
    <div>
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-on-surface mb-2">
          이번 주 무료 챔피언
        </h2>
        <p className="text-on-surface-medium text-sm">
          무료로 플레이할 수 있는 챔피언을 확인하세요
        </p>
      </div>

      {isLoading || isChampionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : champions.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {champions.map((champion) => (
            <div
              key={champion.id}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-divider group-hover:border-primary transition-colors mb-1">
                <Image
                  src={getChampionImageUrl(champion.id)}
                  alt={champion.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-on-surface text-xs text-center font-medium group-hover:text-primary transition-colors">
                {champion.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-on-surface-medium py-12">
          챔피언 로테이션 정보를 불러올 수 없습니다.
        </div>
      )}
    </div>
  );
}
