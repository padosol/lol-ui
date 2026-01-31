"use client";

import { useChampionRotate } from "@/hooks/useChampion";
import { getChampionImageUrl, getChampionsByIds } from "@/utils/champion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
}

export default function DesktopAppSection() {
  const { data: rotationData, isLoading } = useChampionRotate("kr");
  const [champions, setChampions] = useState<ChampionData[]>([]);
  const [hasLoadedChampions, setHasLoadedChampions] = useState(false);

  useEffect(() => {
    if (
      rotationData?.freeChampionIds &&
      rotationData.freeChampionIds.length > 0
    ) {
      getChampionsByIds(rotationData.freeChampionIds)
        .then(setChampions)
        .finally(() => setHasLoadedChampions(true));
    }
  }, [rotationData]);

  // rotationData가 있고 아직 로드 완료되지 않았으면 로딩 중
  const isChampionsLoading =
    !isLoading &&
    rotationData?.freeChampionIds &&
    rotationData.freeChampionIds.length > 0 &&
    !hasLoadedChampions;

  return (
    <section className="bg-gradient-to-br from-surface to-surface-4 py-16 min-h-[300px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
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
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
            {champions.map((champion) => (
              <div
                key={champion.id}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-divider group-hover:border-primary transition-colors mb-2">
                  <Image
                    src={getChampionImageUrl(champion.id)}
                    alt={champion.name}
                    fill
                    sizes="64px"
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
    </section>
  );
}
