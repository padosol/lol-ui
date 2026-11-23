import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import type { MemberProfile } from "@/entities/auth";
import { isAdminAccessDenied, resolveAdminAccess } from "./adminAccess";

const member: MemberProfile = {
  id: 1,
  uuid: "u-1",
  email: "a@b.c",
  nickname: "nick",
  profileImageUrl: "",
  socialAccounts: [],
};
const admin: MemberProfile = { ...member, role: "ADMIN" };
const user: MemberProfile = { ...member, role: "USER" };

describe("resolveAdminAccess", () => {
  it("저장소 복원 전에는 기다린다", () => {
    expect(resolveAdminAccess({ hasHydrated: false, status: "unknown", user: null })).toBe("pending");
  });

  it("로그인하지 않았으면 anonymous", () => {
    expect(resolveAdminAccess({ hasHydrated: true, status: "anonymous", user: null })).toBe("anonymous");
  });

  it("ADMIN 이면 열어 준다 — 세션 확인 전이어도(서버가 다시 검사한다)", () => {
    expect(resolveAdminAccess({ hasHydrated: true, status: "authenticated", user: admin })).toBe("granted");
    expect(resolveAdminAccess({ hasHydrated: true, status: "unknown", user: admin })).toBe("granted");
  });

  it("세션 확인 전의 저장된 user 가 ADMIN 이 아니면 확인을 기다린다", () => {
    // 저장된 user 는 role 이 생기기 전 것일 수 있다. /me 가 ADMIN 을 돌려줄 수 있으니 바로 막지 않는다.
    expect(resolveAdminAccess({ hasHydrated: true, status: "unknown", user: member })).toBe("pending");
  });

  it("확인된 일반 회원은 권한 없음", () => {
    expect(resolveAdminAccess({ hasHydrated: true, status: "authenticated", user })).toBe("forbidden");
    expect(resolveAdminAccess({ hasHydrated: true, status: "authenticated", user: member })).toBe("forbidden");
  });

  it("네트워크 오류로 확인하지 못했으면 저장된 role 로 판정한다", () => {
    expect(resolveAdminAccess({ hasHydrated: true, status: "unverified", user })).toBe("forbidden");
    expect(resolveAdminAccess({ hasHydrated: true, status: "unverified", user: admin })).toBe("granted");
  });
});

describe("isAdminAccessDenied", () => {
  const withStatus = (status: number) =>
    new AxiosError(String(status), "ERR_BAD_REQUEST", undefined, null, { status } as AxiosResponse);

  it("403 과 401 을 모두 권한 없음으로 본다", () => {
    // 서버에 AccessDeniedHandler 가 없어 USER 의 관리자 호출이 401 로 바뀌어 올 수 있다.
    expect(isAdminAccessDenied(withStatus(403))).toBe(true);
    expect(isAdminAccessDenied(withStatus(401))).toBe(true);
  });

  it("그 밖의 오류는 권한 문제가 아니다", () => {
    expect(isAdminAccessDenied(withStatus(400))).toBe(false);
    expect(isAdminAccessDenied(withStatus(409))).toBe(false);
    expect(isAdminAccessDenied(withStatus(500))).toBe(false);
    expect(isAdminAccessDenied(new AxiosError("Network Error", "ERR_NETWORK"))).toBe(false);
    expect(isAdminAccessDenied(null)).toBe(false);
  });
});
