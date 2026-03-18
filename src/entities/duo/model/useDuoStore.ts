import { create } from "zustand";
import type { DuoListing } from "../types";

interface DuoState {
  listings: DuoListing[];
  addListing: (listing: Omit<DuoListing, "id" | "createdAt">) => void;
  removeListing: (id: string) => void;
}

const MOCK_LISTINGS: DuoListing[] = [
  {
    id: "1",
    summonerName: "Hide on bush",
    tagLine: "KR1",
    tier: "CHALLENGER",
    rank: "I",
    gameType: "SOLO_RANK",
    position: "MIDDLE",
    champions: ["Ahri", "Syndra", "Orianna"],
    memo: "미드 장인입니다. 듀오 정글 구합니다",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    summonerName: "정글러구해요",
    tagLine: "KR1",
    tier: "DIAMOND",
    rank: "II",
    gameType: "SOLO_RANK",
    position: "BOTTOM",
    champions: ["Jinx", "Kaisa", "Ezreal"],
    memo: "원딜 메인, 서폿 듀오 구합니다!",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "3",
    summonerName: "탑신병자",
    tagLine: "1234",
    tier: "PLATINUM",
    rank: "I",
    gameType: "SOLO_RANK",
    position: "TOP",
    champions: ["Darius", "Garen", "Mordekaiser"],
    memo: "탑 브루저 장인, 같이 랭크 올려요",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "4",
    summonerName: "서포터장인",
    tagLine: "sup1",
    tier: "EMERALD",
    rank: "III",
    gameType: "FLEX_RANK",
    position: "UTILITY",
    champions: ["Lulu", "Nami", "Thresh"],
    memo: "자랭 듀오 구합니다~ 원딜분 환영",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "5",
    summonerName: "칼바람매니아",
    tagLine: "ARAM",
    tier: "GOLD",
    rank: "II",
    gameType: "ARAM",
    position: "MIDDLE",
    champions: ["Lux", "Xerath", "Ziggs"],
    memo: "칼바람 같이 하실분~ 편하게 연락주세요",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "6",
    summonerName: "정글갓",
    tagLine: "JG01",
    tier: "DIAMOND",
    rank: "IV",
    gameType: "SOLO_RANK",
    position: "JUNGLE",
    champions: ["LeeSin", "Viego", "Graves"],
    memo: "정글 메인입니다. 미드 듀오 찾습니다",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "7",
    summonerName: "일겜하자",
    tagLine: "NOR1",
    tier: "SILVER",
    rank: "I",
    gameType: "NORMAL",
    position: "BOTTOM",
    champions: ["MissFortune", "Ashe"],
    memo: "일반겜 편하게 하실분 구해요",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "8",
    summonerName: "미드차이",
    tagLine: "KR99",
    tier: "MASTER",
    rank: "I",
    gameType: "SOLO_RANK",
    position: "MIDDLE",
    champions: ["Zed", "Yasuo", "Yone"],
    memo: "어쌔신 장인, 정글 듀오 구합니다",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "9",
    summonerName: "꽃길만걷자",
    tagLine: "SUP2",
    tier: "GOLD",
    rank: "I",
    gameType: "FLEX_RANK",
    position: "UTILITY",
    champions: ["Yuumi", "Soraka", "Janna"],
    memo: "힐서폿 전문! 자랭 원딜 듀오 구합니다",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "10",
    summonerName: "탱커전문가",
    tagLine: "TOP1",
    tier: "PLATINUM",
    rank: "III",
    gameType: "SOLO_RANK",
    position: "TOP",
    champions: ["Ornn", "Malphite", "Sion"],
    memo: "탱커 장인입니다. 캐리해주실 분 찾아요",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

export const useDuoStore = create<DuoState>((set) => ({
  listings: MOCK_LISTINGS,
  addListing: (listing) =>
    set((state) => ({
      listings: [
        {
          ...listing,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...state.listings,
      ],
    })),
  removeListing: (id) =>
    set((state) => ({
      listings: state.listings.filter((l) => l.id !== id),
    })),
}));
