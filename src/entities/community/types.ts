/**
 * 게시판 식별자. 서버가 목록 조회·작성에서 모두 DB id 를 받으므로 프론트도 id 를
 * 정본으로 쓴다. code(GENERAL)는 사람이 읽는 값일 뿐 요청에 실리지 않는다.
 */
export type CategoryId = number;

export type PostSort = "HOT" | "NEW" | "TOP";
export type PostPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ALL";
export type VoteType = "UPVOTE" | "DOWNVOTE";
export type VoteTargetType = "POST" | "COMMENT";

/** 게시판 하나. name 은 서버가 요청 로케일에 맞춰 해석해 내려준 라벨이다. */
export interface CategoryItem {
  /** 목록 조회·글 작성에 그대로 실어 보내는 값. */
  id: CategoryId;
  code: string;
  name: string;
  description: string | null;
  /** 그룹 안에서의 상대 순서. 그룹이 다르면 값이 겹칠 수 있다. */
  order: number;
  /** false 면 사이드바·필터칩에서 숨긴다. 라벨 해석에는 그대로 쓴다. */
  visible: boolean;
  /** false 면 읽기 전용 게시판(공지 등). */
  writable: boolean;
  icon: string | null;
}

/** 사이드바 섹션. categories 는 빈 배열일 수 있다(그 경우 "준비 중"). */
export interface BoardGroupItem {
  code: string;
  name: string;
  /** 사이드바에서의 전역 순서. */
  order: number;
  categories: CategoryItem[];
}

/**
 * 배열 순서가 곧 화면 순서다. 서버가 그룹핑과 정렬을 끝내서 보내므로
 * 받는 쪽에서 다시 묶거나 정렬하지 않는다.
 */
export interface CategoryTree {
  groups: BoardGroupItem[];
}

// 정렬 라벨은 messages 의 domain.postSort / domain.postPeriod 에서 가져온다.
// 게시판 라벨만 서버 응답(CategoryItem.name)을 쓴다.

export const POST_SORTS: readonly PostSort[] = ["HOT", "NEW", "TOP"];
export const POST_PERIODS: readonly PostPeriod[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "ALL",
];

export interface Author {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  categoryId: CategoryId;
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  author: Author;
  currentUserVote: VoteType | null;
  currentUserBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostListItem {
  id: number;
  title: string;
  categoryId: CategoryId;
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
  categoryId: CategoryId;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  categoryId: CategoryId;
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
  categoryId?: CategoryId;
  sort?: PostSort;
  period?: PostPeriod;
  page?: number;
}

export interface PostSearchParams {
  keyword: string;
  page?: number;
}
