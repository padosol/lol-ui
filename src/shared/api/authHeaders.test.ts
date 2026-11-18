import { describe, it, expect } from "vitest";
import { ACCESS_TOKEN_COOKIE, bearerAuthHeaders } from "./authHeaders";

describe("bearerAuthHeaders", () => {
  it("토큰이 없으면 빈 헤더", () => {
    expect(bearerAuthHeaders(undefined)).toEqual({});
    expect(bearerAuthHeaders("")).toEqual({});
  });

  it("토큰이 있으면 Bearer 헤더", () => {
    expect(bearerAuthHeaders("abc")).toEqual({ Authorization: "Bearer abc" });
  });

  it("쿠키 이름은 accessToken", () => {
    expect(ACCESS_TOKEN_COOKIE).toBe("accessToken");
  });
});
