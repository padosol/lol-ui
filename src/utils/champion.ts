/**
 * 챔피언 이미지 URL 생성 유틸리티
 */

import {
  useGameDataStore,
  type ChampionData,
  type ChampionJson,
} from "@/stores/useGameDataStore";

/**
 * 챔피언 JSON 데이터를 로드합니다 (zustand store 사용)
 */
async function loadChampionData(): Promise<ChampionJson | null> {
  const store = useGameDataStore.getState();

  // 이미 로드되었으면 반환
  if (store.championData) {
    return store.championData;
  }

  // 로드 시작
  await store.loadChampionData();

  // 로드 완료 후 반환
  return useGameDataStore.getState().championData;
}

/**
 * 챔피언 ID로 챔피언 정보를 가져옵니다.
 * @param championId 챔피언 ID (예: 1, 2, 266)
 * @returns 챔피언 정보 또는 null
 */
export async function getChampionById(
  championId: number
): Promise<ChampionData | null> {
  try {
    const data = await loadChampionData();
    if (!data) {
      return null;
    }
    const key = String(championId);
    return data.data[key] || null;
  } catch (error) {
    console.error("Failed to load champion data:", error);
    return null;
  }
}

/**
 * 여러 챔피언 ID로 챔피언 정보를 가져옵니다.
 * @param championIds 챔피언 ID 배열
 * @returns 챔피언 정보 배열
 */
export async function getChampionsByIds(
  championIds: number[]
): Promise<ChampionData[]> {
  try {
    const data = await loadChampionData();
    if (!data) {
      return [];
    }
    return championIds
      .map((id) => {
        const key = String(id);
        return data.data[key] || null;
      })
      .filter((champion): champion is ChampionData => champion !== null);
  } catch (error) {
    console.error("Failed to load champion data:", error);
    return [];
  }
}

/**
 * 챔피언명으로 이미지 URL을 생성합니다.
 * @param championName 챔피언 이름 (예: "Aatrox", "Ahri")
 * @returns 챔피언 이미지 URL
 */
export function getChampionImageUrl(championName: string): string {
  if (!championName) {
    return "";
  }
  return `https://static.mmrtr.shop/champion/${championName}.png`;
}

/**
 * 영문 챔피언 이름으로 한글 이름을 가져옵니다.
 * @param englishName 영문 챔피언 이름 (예: "Annie", "Aatrox")
 * @returns 한글 챔피언 이름 또는 영문 이름 (데이터가 없을 경우)
 */
export function getChampionNameByEnglishName(englishName: string): string {
  if (!englishName) {
    return "";
  }

  const store = useGameDataStore.getState();
  const championData = store.championData;

  if (!championData || !championData.data) {
    return englishName;
  }

  // championData.data의 모든 챔피언을 순회하여 id가 일치하는 것을 찾습니다
  for (const key in championData.data) {
    const champion = championData.data[key];
    if (champion.id === englishName) {
      return champion.name;
    }
  }

  // 찾지 못한 경우 영문 이름 반환
  return englishName;
}
