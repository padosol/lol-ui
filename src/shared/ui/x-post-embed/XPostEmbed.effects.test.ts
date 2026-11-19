import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Result = "ready" | "failed" | "aborted";
type Options = { theme: string; lang: string };
interface Call {
  options: Options;
  signal: AbortSignal;
  resolve: (r: Result) => void;
}

const calls: Call[] = [];
const renderXPost = vi.fn(
  (
    _target: HTMLElement,
    _id: string,
    options: Options,
    signal: AbortSignal,
  ) =>
    new Promise<Result>((resolve) => {
      calls.push({ options, signal, resolve });
    }),
);

vi.mock("@/shared/lib/x-post", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/lib/x-post")>(
      "@/shared/lib/x-post",
    );
  return {
    ...actual,
    renderXPost: (...a: Parameters<typeof renderXPost>) => renderXPost(...a),
  };
});

import XPostEmbed from "./XPostEmbed";

const POST_URL = "https://x.com/LoLDev/status/1";
let container: HTMLDivElement;
let root: Root;

const state = () =>
  container.querySelector(".x-post-embed")?.getAttribute("data-state");
const link = () => container.querySelector(".x-post-embed__link");

async function setTheme(theme: "dark" | "light") {
  document.documentElement.className = theme;
  // MutationObserver 콜백은 비동기라 한 번 흘려보낸다.
  await act(async () => {});
}

async function settle(call: Call, result: Result) {
  await act(async () => {
    call.resolve(result);
  });
}

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  // IntersectionObserver 가 없으면 바로 보이는 것으로 친다.
  vi.stubGlobal("IntersectionObserver", undefined);
  calls.length = 0;
  renderXPost.mockClear();
  document.documentElement.className = "dark";
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      // eslint-disable-next-line react/no-children-prop
      createElement(NextIntlClientProvider, {
        locale: "ko",
        messages: {},
        children: createElement(XPostEmbed, { url: POST_URL }),
      }),
    );
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  document.documentElement.className = "";
  vi.unstubAllGlobals();
});

describe("XPostEmbed 효과", () => {
  it("보이면 renderXPost 를 부르고 성공하면 링크를 숨긴다", async () => {
    expect(renderXPost).toHaveBeenCalledTimes(1);
    expect(state()).toBe("loading");
    expect(link()).not.toBeNull();
    await settle(calls[0], "ready");
    expect(state()).toBe("ready");
    expect(link()).toBeNull();
  });

  it("실패하면 링크를 남기고 로딩 자리를 거둔다", async () => {
    await settle(calls[0], "failed");
    expect(state()).toBe("failed");
    expect(link()).not.toBeNull();
  });

  it("테마가 바뀌면 새 테마로 다시 그린다", async () => {
    await setTheme("light");
    expect(renderXPost).toHaveBeenCalledTimes(2);
    expect(renderXPost.mock.calls[1][2]).toEqual({
      theme: "light",
      lang: "ko",
    });
  });

  it("테마를 A→B→A 로 바꾸는 동안 지난 결과를 ready 로 보이지 않는다", async () => {
    await settle(calls[0], "ready");
    expect(state()).toBe("ready");
    await setTheme("light");
    await setTheme("dark");
    expect(calls).toHaveLength(3);
    expect(state()).toBe("loading");
    expect(link()).not.toBeNull();
  });

  it("abort 된 렌더가 늦게 failed 를 돌려줘도 현재 결과를 덮지 않는다", async () => {
    await setTheme("light");
    await settle(calls[1], "ready");
    expect(state()).toBe("ready");
    expect(calls[0].signal.aborted).toBe(true);
    await settle(calls[0], "failed");
    expect(state()).toBe("ready");
  });
});
