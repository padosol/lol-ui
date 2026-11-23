import axios from "axios";
import type { ApiResponse } from "./types";

/**
 * 서버가 오류 본문(`ApiResponse.errorMessage.message`)에 실어 보낸 문구. 없으면 undefined.
 *
 * <p>거부 사유(ErrorType)는 응답에 이름으로 실리지 않는다. errorCode 는 E400·E409 같은 HTTP 류
 * 코드라 같은 코드 안의 사유는 이 문구로만 구분된다. 문구 문자열로 분기하지 말고 그대로 보여준다.
 */
export function getApiErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const body: unknown = error.response?.data;
  if (typeof body !== "object" || body === null) return undefined;
  const message = (body as Partial<ApiResponse<unknown>>).errorMessage?.message;
  return typeof message === "string" && message.trim() !== "" ? message : undefined;
}

/** 오류 응답의 HTTP 상태 코드. 응답이 없는 네트워크 오류·타임아웃이면 undefined. */
export function getApiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
