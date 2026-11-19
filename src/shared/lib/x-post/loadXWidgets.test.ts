import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { XWidgetsApi } from "./loadXWidgets";
import { X_WIDGETS_SRC } from "./loadXWidgets";

function injectedScripts() {
  return document.querySelectorAll(`script[src="${X_WIDGETS_SRC}"]`);
}

describe("loadXWidgets", () => {
  beforeEach(() => {
    // 모듈 안 싱글턴을 테스트마다 비운다
    vi.resetModules();
    document.head.innerHTML = "";
    delete window.twttr;
  });

  it("여러 번 불러도 script 는 하나만 넣고 같은 Promise 를 준다", async () => {
    const { loadXWidgets } = await import("./loadXWidgets");
    const a = loadXWidgets();
    const b = loadXWidgets();
    expect(a).toBe(b);
    expect(injectedScripts()).toHaveLength(1);
  });

  it("load 뒤 twttr.ready 가 넘긴 api 로 resolve 한다", async () => {
    const { loadXWidgets } = await import("./loadXWidgets");
    const pending = loadXWidgets();
    const api = {
      widgets: { createTweet: vi.fn() },
      ready: (cb: (api: XWidgetsApi) => void) => cb(api),
    } as unknown as XWidgetsApi;
    window.twttr = api;
    injectedScripts()[0].dispatchEvent(new Event("load"));
    await expect(pending).resolves.toBe(api);
  });

  it("로드 실패 뒤에도 script 는 하나뿐이다", async () => {
    const { loadXWidgets } = await import("./loadXWidgets");
    const first = loadXWidgets();
    injectedScripts()[0].dispatchEvent(new Event("error"));
    await expect(first).rejects.toThrow();
    await expect(loadXWidgets()).rejects.toThrow();
    expect(injectedScripts()).toHaveLength(1);
  });

  it("load 됐는데 twttr 가 없으면 reject 한다", async () => {
    const { loadXWidgets } = await import("./loadXWidgets");
    const pending = loadXWidgets();
    injectedScripts()[0].dispatchEvent(new Event("load"));
    await expect(pending).rejects.toThrow();
  });

  describe("응답이 없는 스크립트", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("10초 안에 load 도 error 도 없으면 reject 하고 다시 넣지 않는다", async () => {
      const { loadXWidgets } = await import("./loadXWidgets");
      const pending = loadXWidgets();
      let settled = false;
      pending.catch(() => {}).finally(() => (settled = true));

      await vi.advanceTimersByTimeAsync(9_999);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      await expect(pending).rejects.toThrow();
      // 실패도 캐시한다. 카드마다 스크립트를 다시 넣어 같은 10초를 또 기다리지 않는다.
      expect(loadXWidgets()).toBe(pending);
      expect(injectedScripts()).toHaveLength(1);
    });

    it("10초 전에 준비되면 그 뒤의 시간 초과는 아무 일도 하지 않는다", async () => {
      const { loadXWidgets } = await import("./loadXWidgets");
      const pending = loadXWidgets();
      const api = {
        widgets: { createTweet: vi.fn() },
        ready: (cb: (api: XWidgetsApi) => void) => cb(api),
      } as unknown as XWidgetsApi;

      await vi.advanceTimersByTimeAsync(5_000);
      window.twttr = api;
      injectedScripts()[0].dispatchEvent(new Event("load"));
      await vi.advanceTimersByTimeAsync(10_000);

      await expect(pending).resolves.toBe(api);
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
