export type GameType = "SOLO_RANK" | "FLEX_RANK" | "NORMAL" | "ARAM";
export type DuoPosition = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  SOLO_RANK: "솔로랭크",
  FLEX_RANK: "자유랭크",
  NORMAL: "일반게임",
  ARAM: "칼바람",
};

export const DUO_POSITION_LABELS: Record<DuoPosition, string> = {
  TOP: "탑",
  JUNGLE: "정글",
  MIDDLE: "미드",
  BOTTOM: "원딜",
  UTILITY: "서포터",
};

export interface DuoListing {
  id: string;
  summonerName: string;
  tagLine: string;
  tier: string;
  rank: string;
  gameType: GameType;
  position: DuoPosition;
  champions: string[];
  memo: string;
  createdAt: string;
}
