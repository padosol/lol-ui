import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api/client";
import type { MemberProfile } from "@/entities/auth";

// 이 Node 런타임은 jsdom 의 localStorage 를 undefined 로 가린다.
// zustand persist 는 스토어 생성 시 저장소를 잡으므로 스토어를 import 하기 전에 stub 한다.
const backing = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => backing.get(key) ?? null,
  setItem: (key: string, value: string) => void backing.set(key, value),
  removeItem: (key: string) => void backing.delete(key),
  clear: () => backing.clear(),
});

const profile: MemberProfile = {
  id: 1,
  uuid: "u-1",
  email: "a@b.c",
  nickname: "nick",
  profileImageUrl: "",
  socialAccounts: [],
};

type Reply = { status: number; data?: unknown };

const calls: string[] = [];
let replies: Record<string, Reply[]> = {};
// 설정돼 있으면 응답을 이 promise 가 풀릴 때까지 붙잡는다 — "확인하는 동안" 을 만든다.
let hold: Promise<void> | undefined;
const originalAdapters = {
  axios: axios.defaults.adapter,
  apiClient: apiClient.defaults.adapter,
};

const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const path = new URL(`${config.baseURL ?? ""}${config.url ?? ""}`).pathname;
  calls.push(`${config.method?.toUpperCase()} ${path}`);
  if (hold) await hold;

  const { status, data } = replies[path]?.shift() ?? { status: 200, data: profile };
  const response: AxiosResponse = {
    data: { result: "SUCCESS", data: data ?? null, errorMessage: null },
    status,
    statusText: String(status),
    headers: {},
    config,
  };
  if (status >= 400) {
    throw new AxiosError(`status ${status}`, String(status), config, null, response);
  }
  return response;
};

/** 응답을 붙잡아 두고, 풀어 주는 함수를 돌려준다. */
function holdResponses(): () => void {
  let release!: () => void;
  hold = new Promise<void>((resolve) => (release = resolve));
  return () => {
    hold = undefined;
    release();
  };
}

let revalidateSession: typeof import("./revalidateSession").revalidateSession;
let useAuthStore: typeof import("@/entities/auth").useAuthStore;

beforeAll(async () => {
  ({ revalidateSession } = await import("./revalidateSession"));
  ({ useAuthStore } = await import("@/entities/auth"));
});

beforeEach(() => {
  calls.length = 0;
  replies = {};
  hold = undefined;
  backing.clear();
  axios.defaults.adapter = adapter;
  apiClient.defaults.adapter = adapter;
  useAuthStore.setState({ user: null, status: "unknown" });
});

afterEach(() => {
  axios.defaults.adapter = originalAdapters.axios;
  apiClient.defaults.adapter = originalAdapters.apiClient;
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("revalidateSession", () => {
  it("저장된 user 가 없으면 요청 없이 anonymous", async () => {
    expect(await revalidateSession()).toBe("anonymous");
    expect(calls).toEqual([]);
    expect(useAuthStore.getState().status).toBe("anonymous");
  });

  it("저장된 user 가 있으면 /me 로 확인해 authenticated", async () => {
    useAuthStore.setState({ user: profile, status: "unknown" });

    expect(await revalidateSession()).toBe("authenticated");
    expect(calls).toEqual(["GET /api/v1/members/me"]);
    expect(useAuthStore.getState()).toMatchObject({ user: profile, status: "authenticated" });
  });

  it("동시에 부르면 확인 요청 하나를 함께 기다린다", async () => {
    useAuthStore.setState({ user: profile, status: "authenticated" });
    const release = holdResponses();

    const first = revalidateSession();
    const second = revalidateSession();
    expect(second).toBe(first);

    release();
    expect(await Promise.all([first, second])).toEqual(["authenticated", "authenticated"]);
    expect(calls).toEqual(["GET /api/v1/members/me"]);
  });

  it("앞선 확인이 끝난 뒤 부르면 새로 확인한다", async () => {
    useAuthStore.setState({ user: profile, status: "authenticated" });

    await revalidateSession();
    await revalidateSession();

    expect(calls).toEqual(["GET /api/v1/members/me", "GET /api/v1/members/me"]);
  });

  it("확인하는 동안 로그아웃하면 user 를 되살리지 않는다", async () => {
    useAuthStore.setState({ user: profile, status: "authenticated" });
    const release = holdResponses();

    const pending = revalidateSession();
    useAuthStore.getState().clearAuth();
    release();
    await pending;

    expect(useAuthStore.getState()).toMatchObject({ user: null, status: "anonymous" });
  });

  it("refresh 가 실패해도 로그인 화면으로 보내지 않고 조용히 로그아웃한다", async () => {
    // jsdom 은 location.href 대입(navigation)을 구현하지 않아 소음을 낸다 — 이동이 없는지도 본다.
    const location = { href: "" };
    vi.stubGlobal("location", location);
    useAuthStore.setState({ user: profile, status: "unknown" });
    replies["/api/v1/members/me"] = [{ status: 401 }, { status: 401 }];
    replies["/api/v1/auth/refresh"] = [{ status: 401 }, { status: 401 }];
    replies["/api/auth/refresh"] = [{ status: 401 }, { status: 401 }];

    expect(await revalidateSession()).toBe("anonymous");
    expect(location.href).toBe("");
    expect(useAuthStore.getState()).toMatchObject({ user: null, status: "anonymous" });
  });
});
