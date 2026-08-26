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

/**
 * 본문에 첨부된 이미지 한 장.
 *
 * `url` 은 CDN **영구** URL 이다. presigned 가 아니므로 만료되지 않고, 그래서 본문
 * 마크다운에 그대로 박아도 시간이 지난 글이 깨지지 않는다.
 *
 * `width`/`height` 는 GIF·WebP 처럼 서버가 헤더만 읽은 경우에도 채워지지만,
 * 스키마가 null 을 허용하므로 레이아웃 계산에 필수로 쓰지 않는다.
 */
export interface PostImage {
  imageId: number;
  url: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
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
  /**
   * 현재 글에 붙어 있는 이미지. 본문 마크다운에 URL 이 이미 들어 있어 렌더링에는
   * 필요 없지만, 수정 화면이 전체 교체 시맨틱을 채우려면 이 목록이 있어야 한다.
   *
   * 이미지 기능 이전에 쓰인 글에는 서버가 빈 배열을 내려준다.
   */
  images: PostImage[];
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
  /**
   * 본문에 붙은 이미지가 있는지. 목록의 사진 아이콘에만 쓴다.
   *
   * 서버는 첨부(ATTACHED)된 것만 센다 — 올리다 만 이미지나 글에서 뺀 이미지는 본문에
   * 보이지 않으므로, 그것까지 세면 사진 없는 글에 아이콘이 붙는다.
   */
  hasImage: boolean;
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
  /** 업로드 API 로 먼저 올린 이미지의 id. 없거나 비어 있으면 첨부 없음. */
  imageIds?: number[];
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  categoryId: CategoryId;
  /**
   * **전체 교체 시맨틱**이다. 목록을 보내면 거기 없는 기존 첨부는 서버에서 떨어져 나가므로,
   * 유지할 이미지를 모두 담아야 한다.
   *
   * 필드를 아예 생략하면(`undefined`) 서버는 첨부를 건드리지 않는다 — 빈 배열(`[]`)과
   * 의미가 다르다. 빈 배열은 "전부 떼라"는 명시적 요청이다.
   */
  imageIds?: number[];
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
