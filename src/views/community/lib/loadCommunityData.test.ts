import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { serverApiClient } from "@/shared/api/server-client";
import { loadPostDetail } from "./loadCommunityData";

/**
 * 상세 SSR 조회가 쿠키의 액세스 토큰을 Authorization 헤더로 옮겨 싣는지 본다.
 * 여기가 끊기면 로그인 사용자도 SSR 첫 화면의 투표·북마크가 비고, 매번 재조회가 붙는다.
 */
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
// 배럴은 UI·훅까지 싣는데, 그중 next-intl 의 클라이언트 내비게이션은 Next 밖에서 풀리지 않는다.
// 이 파일이 쓰는 api·상수만 실제 모듈 그대로 내보낸다.
vi.mock("@/entities/community", async () => ({
  ...(await vi.importActual<object>("@/entities/community/api/communityApi")),
  ...(await vi.importActual<object>("@/entities/community/api/categoryApi")),
  ...(await vi.importActual<object>("@/entities/community/types")),
}));

const requests: InternalAxiosRequestConfig[] = [];
const originalAdapter = serverApiClient.defaults.adapter;

const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  requests.push(config);
  const response: AxiosResponse = {
    data: { result: "SUCCESS", data: { id: 0 }, errorMessage: null },
    status: 200,
    statusText: "200",
    headers: {},
    config,
  };
  return response;
};

function cookieStore(values: Record<string, string>) {
  return {
    get: (name: string) => (name in values ? { name, value: values[name] } : undefined),
  } as unknown as Awaited<ReturnType<typeof cookies>>;
}

beforeEach(() => {
  requests.length = 0;
  serverApiClient.defaults.adapter = adapter;
});

afterEach(() => {
  serverApiClient.defaults.adapter = originalAdapter;
});

// React 의 cache 가 요청 밖에서 기억할 수도 있어 테스트마다 다른 글 id 를 쓴다.
describe("loadPostDetail", () => {
  it("accessToken 쿠키가 있으면 Bearer 헤더로 싣는다", async () => {
    vi.mocked(cookies).mockResolvedValue(cookieStore({ accessToken: "tok" }));

    await loadPostDetail(42);

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("/v1/community/posts/42");
    expect(requests[0].headers.get("Authorization")).toBe("Bearer tok");
  });

  it("accessToken 쿠키가 없으면 Authorization 헤더를 싣지 않는다", async () => {
    vi.mocked(cookies).mockResolvedValue(cookieStore({ visitorId: "v-1" }));

    await loadPostDetail(43);

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("/v1/community/posts/43");
    expect(requests[0].headers.has("Authorization")).toBe(false);
  });
});
