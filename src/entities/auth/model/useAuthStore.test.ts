import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryStorage } from "@/shared/lib/testing/memoryStorage";
import type { MemberProfile } from "../types";

// zustand persist 는 스토어 생성 시 저장소를 잡으므로 import 전에 stub 한다.
vi.stubGlobal("localStorage", createMemoryStorage());

const profile: MemberProfile = {
  id: 1,
  uuid: "u-1",
  email: "a@b.c",
  nickname: "nick",
  profileImageUrl: "",
  socialAccounts: [],
};

let useAuthStore: typeof import("./useAuthStore").useAuthStore;

beforeAll(async () => {
  ({ useAuthStore } = await import("./useAuthStore"));
});

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, status: "unknown" });
});

describe("useAuthStore status", () => {
  it("초기 status 는 unknown 이다", () => {
    expect(useAuthStore.getState().status).toBe("unknown");
  });

  it("setUser 는 authenticated, clearAuth 는 anonymous 로 바꾼다", () => {
    useAuthStore.getState().setUser(profile);
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().user).toEqual(profile);

    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState().status).toBe("anonymous");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("setStatus 는 user 를 건드리지 않고 status 만 바꾼다", () => {
    useAuthStore.getState().setUser(profile);
    useAuthStore.getState().setStatus("unverified");
    expect(useAuthStore.getState().status).toBe("unverified");
    expect(useAuthStore.getState().user).toEqual(profile);
  });

  it("status 는 저장소에 남기지 않는다", () => {
    useAuthStore.getState().setUser(profile);
    expect(JSON.parse(localStorage.getItem("auth-storage")!).state).toEqual({ user: profile });
  });
});
