import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api/client";
import { createMemoryStorage } from "@/shared/lib/testing/memoryStorage";
import type { Post } from "../types";
import { postDetailKey } from "./usePostDetail";
import { recordPostViewAndSync } from "./recordPostView";

type Reply = { status: number; data?: unknown };

const calls: string[] = [];
let replies: Record<string, Reply[]> = {};
const originalAdapters = {
  axios: axios.defaults.adapter,
  apiClient: apiClient.defaults.adapter,
};

const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const path = new URL(url).pathname;
  calls.push(`${config.method?.toUpperCase()} ${path}`);

  const { status, data } = replies[path]?.shift() ?? { status: 200 };
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

const post = { id: 42, viewCount: 10, viewerAuthenticated: false } as Post;
let queryClient: QueryClient;

beforeEach(() => {
  calls.length = 0;
  replies = {};
  axios.defaults.adapter = adapter;
  apiClient.defaults.adapter = adapter;
  queryClient = new QueryClient();
});

afterEach(() => {
  axios.defaults.adapter = originalAdapters.axios;
  apiClient.defaults.adapter = originalAdapters.apiClient;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("recordPostViewAndSync", () => {
  it("성공하면 조회 기록 경로로 POST 하고 캐시의 viewCount 를 바꾼다", async () => {
    queryClient.setQueryData(postDetailKey(42), post);
    replies["/api/v1/community/posts/42/views"] = [{ status: 200, data: { viewCount: 11 } }];

    await recordPostViewAndSync(queryClient, 42);

    expect(calls).toEqual(["POST /api/v1/community/posts/42/views"]);
    expect(queryClient.getQueryData<Post>(postDetailKey(42))?.viewCount).toBe(11);
  });

  it("실패해도 throw 하지 않고 캐시를 유지한다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    queryClient.setQueryData(postDetailKey(42), post);
    replies["/api/v1/community/posts/42/views"] = [{ status: 500 }];

    await expect(recordPostViewAndSync(queryClient, 42)).resolves.toBeUndefined();
    expect(queryClient.getQueryData<Post>(postDetailKey(42))?.viewCount).toBe(10);
  });

  it("캐시가 비어 있으면 그대로 둔다", async () => {
    replies["/api/v1/community/posts/42/views"] = [{ status: 200, data: { viewCount: 11 } }];

    await recordPostViewAndSync(queryClient, 42);

    expect(queryClient.getQueryData(postDetailKey(42))).toBeUndefined();
  });

  it("401 + refresh 실패여도 resolve 하고 캐시·auth-storage 를 건드리지 않는다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("localStorage", createMemoryStorage({ "auth-storage": "kept" }));
    const location = { href: "" };
    vi.stubGlobal("location", location);
    queryClient.setQueryData(postDetailKey(42), post);
    replies["/api/v1/community/posts/42/views"] = [{ status: 401 }];
    replies["/api/v1/auth/refresh"] = [{ status: 401 }];
    replies["/api/auth/refresh"] = [{ status: 401 }];

    await expect(recordPostViewAndSync(queryClient, 42)).resolves.toBeUndefined();

    expect(queryClient.getQueryData<Post>(postDetailKey(42))?.viewCount).toBe(10);
    expect(localStorage.getItem("auth-storage")).toBe("kept");
    expect(location.href).toBe("");
  });
});
