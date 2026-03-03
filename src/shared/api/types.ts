// API 응답 래퍼 타입 (문서 기준)
export interface ApiResponse<T> {
  result: "SUCCESS" | "FAIL";
  data: T;
  errorMessage: string | null;
}

// API 에러 타입
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
