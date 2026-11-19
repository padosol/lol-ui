import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
