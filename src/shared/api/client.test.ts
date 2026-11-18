import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./client";
import { createMemoryStorage } from "@/shared/lib/testing/memoryStorage";

/**
 * 401 을 받으면 refresh 후 원래 요청을 다시 보내는 인터셉터를 본다.
 *
 * <p>refresh 쿠키는 새 Path(/api/v1/auth/refresh)와 옛 Path(/api/auth/refresh)에 따로 있다.
 * 새 Path 쿠키가 없는 사용자는 새 경로에서 401 을 받으므로, 그때만 옛 경로로 넘어가야 한다.
 * 여기가 어긋나면 그 사용자는 액세스 토큰이 만료되는 순간 로그아웃된다.
 */
type Reply = { status: number };

const calls: string[] = [];
// 어댑터가 받은 요청 설정. 경로별 마지막 것만 둔다.
const configs: Record<string, InternalAxiosRequestConfig> = {};
let replies: Record<string, Reply[]> = {};
const originalAdapters = {
  axios: axios.defaults.adapter,
  apiClient: apiClient.defaults.adapter,
};

const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const path = new URL(url).pathname;
  calls.push(`${config.method?.toUpperCase()} ${path}`);
  configs[path] = config;

  const { status } = replies[path]?.shift() ?? { status: 200 };
  const response: AxiosResponse = {
    data: { result: "SUCCESS", data: null, errorMessage: null },
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

beforeEach(() => {
  calls.length = 0;
  for (const path of Object.keys(configs)) delete configs[path];
  replies = {};
  // refresh 는 순환을 피하려고 apiClient 가 아니라 axios 로 직접 보낸다 — 둘 다 가로챈다.
  axios.defaults.adapter = adapter;
  apiClient.defaults.adapter = adapter;
});

afterEach(() => {
  axios.defaults.adapter = originalAdapters.axios;
  apiClient.defaults.adapter = originalAdapters.apiClient;
});

describe("401 토큰 갱신", () => {
  it("새 경로 refresh 가 되면 옛 경로는 부르지 않는다", async () => {
    replies["/api/v1/members/me"] = [{ status: 401 }];

    await apiClient.get("/v1/members/me");

    expect(calls).toEqual([
      "GET /api/v1/members/me",
      "POST /api/v1/auth/refresh",
      "GET /api/v1/members/me",
    ]);
  });

  it("새 경로 refresh 가 401 이면 옛 경로로 한 번 더 시도한다", async () => {
    replies["/api/v1/members/me"] = [{ status: 401 }];
    replies["/api/v1/auth/refresh"] = [{ status: 401 }];

    await apiClient.get("/v1/members/me");

    expect(calls).toEqual([
      "GET /api/v1/members/me",
      "POST /api/v1/auth/refresh",
      "POST /api/auth/refresh",
      "GET /api/v1/members/me",
    ]);
  });

  // 세션 확인이 조회 기록을 붙잡고 있어서, refresh 가 응답 없이 매달리면 기록도 영영 나가지 않는다.
  it("refresh 요청은 두 경로 모두 10초 타임아웃을 싣는다", async () => {
    replies["/api/v1/members/me"] = [{ status: 401 }];
    replies["/api/v1/auth/refresh"] = [{ status: 401 }];

    await apiClient.get("/v1/members/me");

    expect(configs["/api/v1/auth/refresh"]?.timeout).toBe(10000);
    expect(configs["/api/auth/refresh"]?.timeout).toBe(10000);
  });
});

describe("skipAuthRedirect", () => {
  function failRefresh() {
    localStorage.setItem("auth-storage", "kept");
    replies["/api/v1/members/me"] = [{ status: 401 }];
    replies["/api/v1/auth/refresh"] = [{ status: 401 }];
    replies["/api/auth/refresh"] = [{ status: 401 }];
  }

  // Node 의 실험적 localStorage 가 jsdom 것을 가려 undefined 가 될 수 있어 메모리 스토어로 고정한다.
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skipAuthRedirect 요청은 refresh 가 실패해도 저장소를 지우지 않고 reject 한다", async () => {
    failRefresh();

    await expect(
      apiClient.get("/v1/members/me", { skipAuthRedirect: true }),
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(localStorage.getItem("auth-storage")).toBe("kept");
  });

  it("skipAuthRedirect 가 없으면 refresh 실패 시 저장소를 지운다", async () => {
    failRefresh();
    // jsdom 은 location.href 대입(navigation)을 구현하지 않아 소음을 낸다 — 이동도 함께 확인한다.
    const location = { href: "" };
    vi.stubGlobal("location", location);

    await expect(apiClient.get("/v1/members/me")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(localStorage.getItem("auth-storage")).toBeNull();
    expect(location.href).toBe("/login");
  });
});
