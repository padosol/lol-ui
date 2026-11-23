import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage, getApiErrorStatus } from "./error";

function axiosErrorWith(status: number, data: unknown): AxiosError {
  return new AxiosError(String(status), "ERR_BAD_REQUEST", undefined, null, {
    status,
    data,
  } as AxiosResponse);
}

describe("getApiErrorMessage", () => {
  it("서버 오류 본문의 message 를 꺼낸다", () => {
    const error = axiosErrorWith(400, {
      result: "ERROR",
      data: null,
      errorMessage: {
        errorCode: "E400",
        message: "효력 발생일에 진행 중인 계약이 없습니다.",
        timestamp: "2026-11-23T12:00:00.000+09:00",
      },
    });

    expect(getApiErrorMessage(error)).toBe("효력 발생일에 진행 중인 계약이 없습니다.");
  });

  it("ApiResponse 가 아닌 본문(Spring 기본 403 등)이면 undefined", () => {
    const error = axiosErrorWith(403, { status: 403, error: "Forbidden", path: "/api/v1/admin/x" });

    expect(getApiErrorMessage(error)).toBeUndefined();
  });

  it("본문이 문자열이거나 비어 있으면 undefined", () => {
    expect(getApiErrorMessage(axiosErrorWith(502, "<html>Bad Gateway</html>"))).toBeUndefined();
    expect(getApiErrorMessage(axiosErrorWith(500, undefined))).toBeUndefined();
  });

  it("message 가 빈 문자열이면 undefined", () => {
    const error = axiosErrorWith(500, {
      result: "ERROR",
      data: null,
      errorMessage: { errorCode: "E500", message: "  ", timestamp: "" },
    });

    expect(getApiErrorMessage(error)).toBeUndefined();
  });

  it("응답 없는 네트워크 오류와 axios 가 아닌 오류는 undefined", () => {
    expect(getApiErrorMessage(new AxiosError("Network Error", "ERR_NETWORK"))).toBeUndefined();
    expect(getApiErrorMessage(new Error("boom"))).toBeUndefined();
  });
});

describe("getApiErrorStatus", () => {
  it("응답의 HTTP 상태 코드를 꺼낸다", () => {
    expect(getApiErrorStatus(axiosErrorWith(409, null))).toBe(409);
  });

  it("응답이 없거나 axios 오류가 아니면 undefined", () => {
    expect(getApiErrorStatus(new AxiosError("Network Error", "ERR_NETWORK"))).toBeUndefined();
    expect(getApiErrorStatus("oops")).toBeUndefined();
  });
});
