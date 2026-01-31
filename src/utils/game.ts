/**
 * 게임 아이템, 스펠, 룬 이미지 URL 생성 유틸리티
 */

import { useGameDataStore, type SummonerJson } from "@/stores/useGameDataStore";

/**
 * 소환사 주문 JSON 데이터를 로드합니다 (zustand store 사용)
 */
async function loadSummonerData(): Promise<SummonerJson | null> {
  const store = useGameDataStore.getState();
  
  // 이미 로드되었으면 반환
  if (store.summonerData) {
    return store.summonerData;
  }

  // 로드 시작
  await store.loadSummonerData();
  
  // 로드 완료 후 반환
  return useGameDataStore.getState().summonerData;
}

/**
 * 아이템 ID로 이미지 URL을 생성합니다.
 * @param itemId 아이템 ID (0이면 빈 슬롯)
 * @returns 아이템 이미지 URL
 */
export function getItemImageUrl(itemId: number): string {
  return `https://static.mmrtr.shop/items/${itemId}.png`;
}

/**
 * 소환사 주문(스펠) ID로 이미지 URL을 생성합니다.
 * @param spellId 소환사 주문 ID (숫자)
 * @returns 소환사 주문 이미지 URL
 */
export async function getSpellImageUrlAsync(spellId: number): Promise<string> {
  if (!spellId || spellId === 0) {
    return "";
  }

  try {
    const data = await loadSummonerData();
    if (!data) {
      return `https://static.mmrtr.shop/spells/${spellId}.png`;
    }
    const key = String(spellId);
    const spell = data.data[key];
    
    if (spell && spell.id) {
      return `https://static.mmrtr.shop/spells/${spell.id}.png`;
    }
    
    // fallback: 원래 방식
    return `https://static.mmrtr.shop/spells/${spellId}.png`;
  } catch (error) {
    console.error("Failed to load summoner data:", error);
    // fallback: 원래 방식
    return `https://static.mmrtr.shop/spells/${spellId}.png`;
  }
}

/**
 * 소환사 주문(스펠) ID로 이미지 URL을 생성합니다 (동기 버전, 캐시된 데이터 사용).
 * @param spellId 소환사 주문 ID
 * @returns 소환사 주문 이미지 URL
 */
export function getSpellImageUrl(spellId: number): string {
  if (!spellId || spellId === 0) {
    return "";
  }
  
  // zustand store에서 데이터 가져오기
  const store = useGameDataStore.getState();
  if (store.summonerData) {
    const key = String(spellId);
    const spell = store.summonerData.data[key];
    if (spell && spell.id) {
      return `https://static.mmrtr.shop/spells/${spell.id}.png`;
    }
  }
  
  // fallback: 원래 방식
  return `https://static.mmrtr.shop/spells/${spellId}.png`;
}

/**
 * 룬(Perk) ID로 이미지 URL을 생성합니다.
 * @param perkId 룬 ID
 * @returns 룬 이미지 URL
 */
export function getPerkImageUrl(perkId: number): string {
  if (!perkId || perkId === 0) {
    return "";
  }
  return `https://static.mmrtr.shop/perks/${perkId}.png`;
}

/**
 * @deprecated getPerkImageUrl을 사용하세요.
 * 룬 ID로 이미지 URL을 생성합니다.
 * @param runeId 룬 ID
 * @returns 룬 이미지 URL
 */
export function getRuneImageUrl(runeId: number): string {
  return getPerkImageUrl(runeId);
}

/**
 * 아이템 배열에서 아이템 ID 배열을 추출합니다.
 * @param item 아이템 객체 또는 배열
 * @returns 아이템 ID 배열 (최대 7개: 0-6 슬롯)
 */
export function extractItemIds(item: any): number[] {
  if (!item) return [0, 0, 0, 0, 0, 0, 0];

  // item이 배열인 경우
  if (Array.isArray(item)) {
    return item.slice(0, 7).map((id) => id || 0);
  }

  // item이 객체인 경우 (item0, item1, ... 형식)
  if (typeof item === "object") {
    const items: number[] = [];
    for (let i = 0; i < 7; i++) {
      const key = `item${i}`;
      items.push(item[key] || 0);
    }
    return items;
  }

  return [0, 0, 0, 0, 0, 0, 0];
}

/**
 * KDA 값에 따라 색상 클래스를 반환합니다.
 * @param kdaValue KDA 값 (문자열 또는 숫자)
 * @returns Tailwind CSS 색상 클래스
 */
export function getKDAColorClass(kdaValue: string | number): string {
  // "perfect" 문자열인 경우 특별한 색상 반환
  if (
    kdaValue === "perfect" ||
    (typeof kdaValue === "string" && kdaValue.toLowerCase() === "perfect")
  ) {
    return "text-stat-high"; // perfect: 금색 계열
  }

  const kda = typeof kdaValue === "string" ? parseFloat(kdaValue) : kdaValue;
  const integerPart = Math.floor(kda);

  if (integerPart >= 5) {
    return "text-stat-perfect"; // 5.x 이상: 오렌지 계열
  } else if (integerPart >= 4) {
    return "text-stat-low"; // 4.x: 빨간색 계열
  } else if (integerPart >= 3) {
    return "text-stat-mid"; // 3.x: 파란색 계열
  } else if (integerPart >= 2) {
    return "text-secondary"; // 2.x: 청록색 계열 (차분한 톤)
  } else {
    return "text-stat-neutral"; // 1.x: 회색 계열
  }
}
