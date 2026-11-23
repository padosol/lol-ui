import { describe, expect, it } from "vitest";
import type { MemberProfile } from "../types";
import { isAdmin } from "./isAdmin";

const base: MemberProfile = {
  id: 1,
  uuid: "u-1",
  email: "a@b.c",
  nickname: "nick",
  profileImageUrl: "",
  socialAccounts: [],
};

describe("isAdmin", () => {
  it("role 이 ADMIN 이면 true", () => {
    expect(isAdmin({ ...base, role: "ADMIN" })).toBe(true);
  });

  it("role 이 USER 면 false", () => {
    expect(isAdmin({ ...base, role: "USER" })).toBe(false);
  });

  it("role 이 없는 옛 응답·저장된 user 는 false", () => {
    expect(isAdmin(base)).toBe(false);
  });

  it("비로그인(null)은 false", () => {
    expect(isAdmin(null)).toBe(false);
  });
});
