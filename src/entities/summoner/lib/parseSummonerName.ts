export interface ParsedSummonerName {
  name: string;
  tagline: string;
  region: string;
}

export function parseSummonerName(input: string): ParsedSummonerName {
  const decoded = decodeURIComponent(input);

  const separator = decoded.includes("-") ? "-" : decoded.includes("#") ? "#" : null;

  if (!separator) {
    return {
      name: decoded,
      tagline: "",
      region: "kr",
    };
  }

  const parts = decoded.split(separator);
  const name = parts[0];
  const tagline = parts.slice(1).join(separator);

  const regionMatch = tagline.match(/^([a-z]{2,3})/i);
  const region = regionMatch ? regionMatch[1].toLowerCase() : "kr";

  return {
    name,
    tagline,
    region,
  };
}

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
