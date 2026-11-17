import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MemberProfile } from "@/entities/auth";
import { bootstrapSession, type SessionBootstrapDeps } from "./bootstrapSession";

const profile: MemberProfile = {
  id: 1,
  uuid: "u-1",
  email: "a@b.c",
  nickname: "nick",
  profileImageUrl: "",
  socialAccounts: [],
};

const unauthorized = new AxiosError("401", "ERR_BAD_REQUEST", undefined, null, {
  status: 401,
} as AxiosResponse);
const serverError = new AxiosError("500", "ERR_BAD_RESPONSE", undefined, null, {
  status: 500,
} as AxiosResponse);
// 탈퇴(MEMBER_WITHDRAWN)·삭제(MEMBER_NOT_FOUND)된 계정은 refresh 나 /me 가 403·404 를 준다.
const forbidden = new AxiosError("403", "ERR_BAD_REQUEST", undefined, null, {
  status: 403,
} as AxiosResponse);
const notFound = new AxiosError("404", "ERR_BAD_REQUEST", undefined, null, {
  status: 404,
} as AxiosResponse);
const networkError = new AxiosError("Network Error", "ERR_NETWORK");

let deps: SessionBootstrapDeps;

beforeEach(() => {
  deps = {
    hasStoredUser: true,
    fetchProfile: vi.fn(),
    setUser: vi.fn(),
    clearAuth: vi.fn(),
    setStatus: vi.fn(),
  };
});

describe("bootstrapSession", () => {
  it("저장된 user 가 없으면 요청 없이 anonymous", async () => {
    expect(await bootstrapSession({ ...deps, hasStoredUser: false })).toBe("anonymous");
    expect(deps.fetchProfile).not.toHaveBeenCalled();
    expect(deps.setStatus).toHaveBeenCalledWith("anonymous");
  });

  it("me 가 성공하면 setUser 하고 authenticated", async () => {
    vi.mocked(deps.fetchProfile).mockResolvedValue(profile);
    expect(await bootstrapSession(deps)).toBe("authenticated");
    expect(deps.setUser).toHaveBeenCalledTimes(1);
    expect(deps.setUser).toHaveBeenCalledWith(profile);
  });

  it("401 뒤 재확인이 성공하면 authenticated", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValueOnce(unauthorized).mockResolvedValueOnce(profile);
    expect(await bootstrapSession(deps)).toBe("authenticated");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(2);
    expect(deps.setUser).toHaveBeenCalledWith(profile);
    expect(deps.clearAuth).not.toHaveBeenCalled();
  });

  it("401 이 두 번이면 조용히 로그아웃한다", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValue(unauthorized);
    expect(await bootstrapSession(deps)).toBe("anonymous");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(2);
    expect(deps.clearAuth).toHaveBeenCalledTimes(1);
  });

  it("401 뒤 재확인이 네트워크 오류면 unverified", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValueOnce(unauthorized).mockRejectedValueOnce(networkError);
    expect(await bootstrapSession(deps)).toBe("unverified");
    expect(deps.setStatus).toHaveBeenCalledWith("unverified");
    expect(deps.clearAuth).not.toHaveBeenCalled();
  });

  it("네트워크 오류면 user 를 유지하고 unverified", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValue(networkError);
    expect(await bootstrapSession(deps)).toBe("unverified");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(1);
    expect(deps.setStatus).toHaveBeenCalledWith("unverified");
    expect(deps.clearAuth).not.toHaveBeenCalled();
    expect(deps.setUser).not.toHaveBeenCalled();
  });

  it("500 이면 unverified", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValue(serverError);
    expect(await bootstrapSession(deps)).toBe("unverified");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(1);
    expect(deps.clearAuth).not.toHaveBeenCalled();
  });

  it("처음부터 403 이면 다시 확인하지 않고 조용히 로그아웃한다", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValue(forbidden);
    expect(await bootstrapSession(deps)).toBe("anonymous");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(1);
    expect(deps.clearAuth).toHaveBeenCalledTimes(1);
    expect(deps.setStatus).not.toHaveBeenCalledWith("unverified");
  });

  it("처음부터 404 면 조용히 로그아웃한다", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValue(notFound);
    expect(await bootstrapSession(deps)).toBe("anonymous");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(1);
    expect(deps.clearAuth).toHaveBeenCalledTimes(1);
  });

  it("401 뒤 재확인이 403 이면 조용히 로그아웃한다", async () => {
    vi.mocked(deps.fetchProfile).mockRejectedValueOnce(unauthorized).mockRejectedValueOnce(forbidden);
    expect(await bootstrapSession(deps)).toBe("anonymous");
    expect(deps.fetchProfile).toHaveBeenCalledTimes(2);
    expect(deps.clearAuth).toHaveBeenCalledTimes(1);
  });
});
