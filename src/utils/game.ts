/**
 * 게임 아이템, 스펠, 룬 이미지 URL 생성 유틸리티
 */

/**
 * 아이템 ID로 이미지 URL을 생성합니다.
 * @param itemId 아이템 ID (0이면 빈 슬롯)
 * @returns 아이템 이미지 URL
 */
export function getItemImageUrl(itemId: number): string {
  if (!itemId || itemId === 0) {
    return "";
  }
  return `https://static.mmrtr.shop/items/${itemId}.png`;
}

/**
 * 소환사 주문(스펠) ID로 이미지 URL을 생성합니다.
 * @param spellId 소환사 주문 ID
 * @returns 소환사 주문 이미지 URL
 */
export function getSpellImageUrl(spellId: number): string {
  if (!spellId || spellId === 0) {
    return "";
  }
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

