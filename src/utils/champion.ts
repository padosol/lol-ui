/**
 * 챔피언 이미지 URL 생성 유틸리티
 */

interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
}

interface ChampionJson {
  data: {
    [key: string]: ChampionData;
  };
}

let championDataCache: ChampionJson | null = null;

/**
 * 챔피언 JSON 데이터를 로드합니다 (캐싱됨)
 */
async function loadChampionData(): Promise<ChampionJson> {
  if (championDataCache) {
    return championDataCache;
  }

  const response = await fetch("/data/champion.json");
  championDataCache = await response.json();
  return championDataCache;
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

