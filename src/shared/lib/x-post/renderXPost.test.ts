import { describe, expect, it, vi } from "vitest";

import type { XWidgetsApi } from "./loadXWidgets";
import { renderXPost } from "./renderXPost";

const opts = { theme: "dark" as const, lang: "ko" };

function fakeApi(result: "ok" | "missing" | "throw") {
  const createTweet = vi.fn(
    async (_id: string, target: HTMLElement): Promise<HTMLElement | undefined> => {
      const iframe = document.createElement("iframe");
      target.appendChild(iframe);
      if (result === "throw") throw new Error("boom");
      return result === "ok" ? iframe : undefined;
    },
  );
  const api = {
    widgets: { createTweet },
    ready: (cb: (api: XWidgetsApi) => void) => cb(api),
  } as unknown as XWidgetsApi & { widgets: { createTweet: typeof createTweet } };
  return api;
}

describe("renderXPost", () => {
  it("성공하면 ready 이고 고정 옵션을 넘긴다", async () => {
    const api = fakeApi("ok");
    const target = document.createElement("div");
    await expect(
      renderXPost(target, "1", opts, new AbortController().signal, async () => api),
    ).resolves.toBe("ready");
    expect(api.widgets.createTweet).toHaveBeenCalledWith("1", expect.any(HTMLElement), {
      theme: "dark",
      lang: "ko",
      dnt: true,
      conversation: "none",
      align: "center",
    });
    const slot = api.widgets.createTweet.mock.calls[0][1];
    expect(slot.parentElement).toBe(target);
  });

  it("오래된 렌더가 늦게 끝나도 새 카드를 지우지 않는다", async () => {
    const target = document.createElement("div");
    const staleIframe = document.createElement("iframe");
    let resolveStale!: (el: HTMLElement) => void;
    const staleApi = {
      widgets: {
        createTweet: vi.fn(
          (_id: string, slot: HTMLElement) =>
            new Promise<HTMLElement | undefined>((resolve) => {
              resolveStale = (el) => {
                slot.appendChild(el);
                resolve(el);
              };
            }),
        ),
      },
    } as unknown as XWidgetsApi;
    const controllerA = new AbortController();
    const a = renderXPost(target, "1", opts, controllerA.signal, async () => staleApi);
    await vi.waitFor(() => expect(staleApi.widgets.createTweet).toHaveBeenCalled());
    controllerA.abort();

    const b = await renderXPost(
      target,
      "1",
      opts,
      new AbortController().signal,
      async () => fakeApi("ok"),
    );
    expect(b).toBe("ready");

    resolveStale(staleIframe);
    await expect(a).resolves.toBe("aborted");
    const iframes = target.querySelectorAll("iframe");
    expect(iframes).toHaveLength(1);
    expect(iframes[0]).not.toBe(staleIframe);
  });

  it("시작 전에 이미 abort 됐으면 target 을 건드리지 않는다", async () => {
    const target = document.createElement("div");
    const child = document.createElement("span");
    target.appendChild(child);
    const controller = new AbortController();
    controller.abort();
    const load = vi.fn(async () => fakeApi("ok"));
    await expect(renderXPost(target, "1", opts, controller.signal, load)).resolves.toBe("aborted");
    expect(target.contains(child)).toBe(true);
    expect(load).not.toHaveBeenCalled();
  });

  it("게시물이 없으면(undefined) failed 이고 컨테이너를 비운다", async () => {
    const target = document.createElement("div");
    await expect(
      renderXPost(target, "1", opts, new AbortController().signal, async () => fakeApi("missing")),
    ).resolves.toBe("failed");
    expect(target.childElementCount).toBe(0);
  });

  it("로더가 reject 하면 failed", async () => {
    const target = document.createElement("div");
    await expect(
      renderXPost(target, "1", opts, new AbortController().signal, () =>
        Promise.reject(new Error("blocked")),
      ),
    ).resolves.toBe("failed");
  });

  it("createTweet 이 throw 하면 failed 이고 컨테이너를 비운다", async () => {
    const target = document.createElement("div");
    await expect(
      renderXPost(target, "1", opts, new AbortController().signal, async () => fakeApi("throw")),
    ).resolves.toBe("failed");
    expect(target.childElementCount).toBe(0);
  });

  it("abort 되면 createTweet 을 부르지 않는다", async () => {
    const api = fakeApi("ok");
    const controller = new AbortController();
    const target = document.createElement("div");
    const pending = renderXPost(target, "1", opts, controller.signal, async () => api);
    controller.abort();
    await expect(pending).resolves.toBe("aborted");
    expect(api.widgets.createTweet).not.toHaveBeenCalled();
  });

  it("그리는 중 abort 되면 aborted 이고 컨테이너를 비운다", async () => {
    const api = fakeApi("ok");
    const controller = new AbortController();
    api.widgets.createTweet.mockImplementationOnce(async (_id: string, target: HTMLElement) => {
      const iframe = document.createElement("iframe");
      target.appendChild(iframe);
      controller.abort();
      return iframe;
    });
    const target = document.createElement("div");
    await expect(
      renderXPost(target, "1", opts, controller.signal, async () => api),
    ).resolves.toBe("aborted");
    expect(target.childElementCount).toBe(0);
  });

  it("같은 컨테이너에 다시 그리면 이전 카드를 지운다", async () => {
    const api = fakeApi("ok");
    const target = document.createElement("div");
    await renderXPost(target, "1", opts, new AbortController().signal, async () => api);
    await renderXPost(
      target,
      "1",
      { ...opts, theme: "light" },
      new AbortController().signal,
      async () => api,
    );
    expect(target.querySelectorAll("iframe")).toHaveLength(1);
  });
});
