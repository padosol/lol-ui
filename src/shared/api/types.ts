/** API 응답 래퍼. lol-server·lol-repository 가 같은 모양으로 내려준다. */
export interface ApiResponse<T> {
  result: "SUCCESS" | "ERROR";
  data: T;
  errorMessage: ApiErrorMessage | null;
}

/**
 * 오류 응답 본문. errorCode 는 ErrorType 이름이 아니라 HTTP 류 코드(E400·E404·E409 …)다.
 * 같은 코드 안의 사유는 message(서버 고정 문구)로만 구분된다 — `getApiErrorMessage` 로 꺼낸다.
 */
export interface ApiErrorMessage {
  errorCode: string;
  message: string;
  timestamp: string;
}

/** 서버 목록 페이지 응답(lol-server PageResponse). page 는 0 기반이다. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

// API 에러 타입
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
