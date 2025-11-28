/**
 * 소환사 이름 파싱 유틸리티
 * 형식: "name-tagline" (예: "hideonbush-kr1")
 */

export interface ParsedSummonerName {
  name: string;
  tagline: string;
  region: string;
}

/**
 * 소환사 이름을 파싱하여 name, tagline, region을 추출
 * @param input 입력된 소환사 이름 (예: "hideonbush-kr1" 또는 "hideonbush#kr1")
 * @returns 파싱된 소환사 정보
 */
export function parseSummonerName(input: string): ParsedSummonerName {
  // URL 디코딩
  const decoded = decodeURIComponent(input);
  
  // "-" 또는 "#"으로 분리
  const separator = decoded.includes("-") ? "-" : decoded.includes("#") ? "#" : null;
  
  if (!separator) {
    // 구분자가 없으면 전체를 name으로, region은 기본값
    return {
      name: decoded,
      tagline: "",
      region: "kr",
    };
  }
  
  const parts = decoded.split(separator);
  const name = parts[0];
  const tagline = parts.slice(1).join(separator); // 여러 개의 구분자가 있을 수 있음
  
  // tagline에서 region 추출 (예: "kr1" -> "kr")
  const regionMatch = tagline.match(/^([a-z]{2,3})/i);
  const region = regionMatch ? regionMatch[1].toLowerCase() : "kr";
  
  return {
    name,
    tagline,
    region,
  };
}

/**
 * region 코드를 API에서 사용하는 형식으로 변환
 * @param region UI에서 선택한 region (예: "KR", "US", "JP")
 * @returns API에서 사용하는 region 코드 (예: "kr", "na", "jp")
 */
export function normalizeRegion(region: string): string {
  const regionMap: Record<string, string> = {
    KR: "kr",
    US: "na",
    JP: "jp",
    EUW: "euw",
    EUNE: "eune",
    BR: "br",
    LAN: "lan",
    LAS: "las",
    OCE: "oce",
    RU: "ru",
    TR: "tr",
  };
  
  return regionMap[region.toUpperCase()] || region.toLowerCase();
}

