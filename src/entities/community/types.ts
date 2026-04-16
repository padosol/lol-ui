export const POST_CATEGORIES = [
  "CHAMPION_DISCUSSION",
  "PATCH_NOTES",
  "TIPS_AND_GUIDES",
  "META_DISCUSSION",
  "COMMUNITY",
  "HUMOR",
  "GENERAL",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export type PostSort = "HOT" | "NEW" | "TOP";
export type PostPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ALL";
export type VoteType = "UPVOTE" | "DOWNVOTE";
export type VoteTargetType = "POST" | "COMMENT";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  CHAMPION_DISCUSSION: "챔피언 토론",
  PATCH_NOTES: "패치노트",
  TIPS_AND_GUIDES: "팁과 가이드",
  META_DISCUSSION: "메타 토론",
  COMMUNITY: "커뮤니티",
  HUMOR: "유머",
  GENERAL: "자유",
};

export const POST_SORT_LABELS: Record<PostSort, string> = {
  HOT: "인기",
  NEW: "최신",
  TOP: "추천",
};

export const POST_PERIOD_LABELS: Record<PostPeriod, string> = {
  DAILY: "오늘",
  WEEKLY: "이번 주",
  MONTHLY: "이번 달",
  ALL: "전체",
};

export interface Author {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: PostCategory;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  author: Author;
  currentUserVote: VoteType | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostListItem {
  id: number;
  title: string;
  category: PostCategory;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  hotScore: number;
  author: Author;
  createdAt: string;
}

export interface PostListResponse {
  content: PostListItem[];
  hasNext: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  parentCommentId: number | null;
  content: string;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  deleted: boolean;
  author: Author;
  createdAt: string;
  updatedAt: string;
  children: Comment[];
}

export interface VoteResponse {
  targetType: VoteTargetType;
  targetId: number;
  voteType: VoteType;
  newUpvoteCount: number;
  newDownvoteCount: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId: number | null;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface VoteRequest {
  targetType: VoteTargetType;
  targetId: number;
  voteType: VoteType;
}

export interface PostListParams {
  category?: PostCategory;
  sort?: PostSort;
  period?: PostPeriod;
  page?: number;
}

export interface PostSearchParams {
  keyword: string;
  page?: number;
}
