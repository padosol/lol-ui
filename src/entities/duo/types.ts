// === Lane ===
export const LANES = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"] as const;
export type Lane = (typeof LANES)[number];

export const LANE_LABELS: Record<Lane, string> = {
  TOP: "탑",
  JUNGLE: "정글",
  MID: "미드",
  ADC: "원딜",
  SUPPORT: "서포터",
};

/** Lane → 포지션 이미지 파일 키 (MID→MIDDLE, ADC→BOTTOM, SUPPORT→UTILITY) */
export const LANE_IMAGE_KEY: Record<Lane, string> = {
  TOP: "TOP",
  JUNGLE: "JUNGLE",
  MID: "MIDDLE",
  ADC: "BOTTOM",
  SUPPORT: "UTILITY",
};

// === Tier ===
export const TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;
export type Tier = (typeof TIERS)[number];

// === Status ===
export type PostStatus = "ACTIVE" | "MATCHED" | "DELETED" | "EXPIRED";
export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  ACTIVE: "모집 중",
  MATCHED: "매칭 완료",
  DELETED: "삭제됨",
  EXPIRED: "만료됨",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  CONFIRMED: "확정됨",
  REJECTED: "거절됨",
  CANCELLED: "취소됨",
};

// === 챔피언 통계 ===
export interface MostChampion {
  championId: number;
  championName: string;
  playCount: number;
  wins: number;
  losses: number;
}

export interface PlayedChampion {
  championId: number;
  championName: string;
}

export interface RecentGameSummary {
  wins: number;
  losses: number;
  playedChampions: PlayedChampion[];
}

// === 게시글 ===
export interface DuoPost {
  id: number;
  primaryLane: Lane;
  desiredLane: Lane;
  hasMicrophone: boolean;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  memo: string;
  status: PostStatus;
  tierAvailable?: boolean;
  requestCount?: number;
  isOwner?: boolean;
  mostChampions?: MostChampion[];
  recentGameSummary?: RecentGameSummary;
  expiresAt: string;
  createdAt: string;
  requests?: DuoRequest[];
}

// === 매칭 요청 ===
export interface DuoRequest {
  id: number;
  duoPostId: number;
  primaryLane: Lane;
  desiredLane: Lane;
  hasMicrophone: boolean;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  memo: string;
  status: RequestStatus;
  mostChampions?: MostChampion[];
  recentGameSummary?: RecentGameSummary;
  createdAt: string;
}

// === 수락/확정 응답 ===
export interface MatchActionResponse {
  duoPostId: number;
  requestId: number;
  partnerGameName: string | null;
  partnerTagLine: string | null;
  status: string;
}

// === 페이지 응답 ===
export interface DuoPostListResponse {
  content: DuoPost[];
  hasNext: boolean;
}

export interface DuoRequestListResponse {
  content: DuoRequest[];
  hasNext: boolean;
}

// === 요청 DTO ===
export interface CreateDuoPostRequest {
  primaryLane: Lane;
  desiredLane: Lane;
  hasMicrophone: boolean;
  memo: string;
}

export interface CreateDuoRequestPayload {
  primaryLane: Lane;
  desiredLane: Lane;
  hasMicrophone: boolean;
  memo: string;
}

// === 필터 ===
export interface DuoPostFilters {
  lane?: Lane;
  tier?: Tier;
  page?: number;
}
