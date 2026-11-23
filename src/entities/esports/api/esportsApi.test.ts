import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api/client";
import {
  getPersonBySummoner,
  getSeasonRosters,
  searchPersons,
  SUMMONER_PERSON_TIMEOUT_MS,
} from "./esportsApi";
import { recordLoanRecall, deleteContract } from "./esportsAdminApi";

let seen: InternalAxiosRequestConfig[] = [];
let reply: { status: number; data?: unknown } = { status: 200 };

const adapter: AxiosAdapter = async (config) => {
  seen.push(config);
  const response: AxiosResponse = {
    data: reply.data ?? { result: "SUCCESS", data: null, errorMessage: null },
    status: reply.status,
    statusText: String(reply.status),
    headers: {},
    config,
  };
  if (reply.status >= 400) {
    throw new AxiosError(`status ${reply.status}`, String(reply.status), config, null, response);
  }
  return response;
};

const client = axios.create({ baseURL: "http://api.test/api", adapter });

beforeEach(() => {
  seen = [];
  reply = { status: 200 };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("공개 조회", () => {
  it("refresh 실패 시 로그인으로 보내지 않도록 skipAuthRedirect 를 붙인다", async () => {
    reply = { status: 200, data: { result: "SUCCESS", data: { content: [] }, errorMessage: null } };

    await searchPersons({ status: "FREE_AGENT", role: "PLAYER" }, client);

    expect(seen[0].skipAuthRedirect).toBe(true);
    expect(seen[0].url).toBe("/v1/esports/persons");
    expect(seen[0].params).toEqual({ status: "FREE_AGENT", role: "PLAYER" });
  });

  it("시즌 로스터는 teamId 가 없으면 쿼리를 싣지 않는다", async () => {
    await getSeasonRosters("lck_2026", undefined, client);
    await getSeasonRosters("lck_2026", "t1", client);

    expect(seen[0].params).toBeUndefined();
    expect(seen[1].params).toEqual({ teamId: "t1" });
  });
});

describe("getPersonBySummoner", () => {
  it("연결된 인물을 돌려준다", async () => {
    const person = { personId: "faker", nickName: "Faker", teamCode: "T1" };
    reply = { status: 200, data: { result: "SUCCESS", data: person, errorMessage: null } };

    await expect(getPersonBySummoner("puuid-1", client)).resolves.toEqual(person);
    expect(seen[0].url).toBe("/v1/esports/summoners/puuid-1/person");
    expect(seen[0].timeout).toBe(SUMMONER_PERSON_TIMEOUT_MS);
    expect(seen[0].skipAuthRedirect).toBe(true);
  });

  it("404(연결 없음·비공개)는 정상 결과라 null", async () => {
    reply = {
      status: 404,
      data: {
        result: "ERROR",
        data: null,
        errorMessage: { errorCode: "E404", message: "존재하지 않는 인물입니다.", timestamp: "" },
      },
    };

    await expect(getPersonBySummoner("puuid-x", client)).resolves.toBeNull();
  });

  it("그 밖의 실패는 던진다", async () => {
    reply = { status: 500 };

    await expect(getPersonBySummoner("puuid-1", client)).rejects.toBeInstanceOf(AxiosError);
  });
});

describe("관리자 API", () => {
  it("임대 복귀는 임대 계약 ID 경로로 보낸다", async () => {
    const post = vi
      .spyOn(apiClient, "post")
      .mockResolvedValue({ data: { result: "SUCCESS", data: { personId: "p" }, errorMessage: null } });

    await recordLoanRecall("zeus", 42, { date: "2026-12-01" });

    expect(post).toHaveBeenCalledWith("/v1/admin/esports/persons/zeus/loans/42/recall", {
      date: "2026-12-01",
    });
  });

  it("DELETE 는 바디 없는 204 라 응답을 읽지 않는다", async () => {
    vi.spyOn(apiClient, "delete").mockResolvedValue({ status: 204, data: "" });

    await expect(deleteContract(7)).resolves.toBeUndefined();
  });
});
