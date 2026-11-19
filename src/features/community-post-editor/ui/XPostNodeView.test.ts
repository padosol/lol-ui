import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Editor, EditorContent } from "@tiptap/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPostEditorExtensions } from "../model/postEditorExtensions";

/**
 * 헤드리스 에디터는 contentComponent 가 없어 NodeView 가 빈 span 으로 대체된다.
 * 선택 테두리 CSS 가 기대는 DOM 은 EditorContent 를 실제로 마운트해야만 볼 수 있다.
 */
const POST = "https://x.com/LoLDev/status/1234567890123456789";

let container: HTMLDivElement;
let root: Root;
let editor: Editor;

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  // 콜백을 부르지 않는 관찰자 — 카드가 idle 에 머물러 widgets.js 를 끌어오지 않는다.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  editor = new Editor({
    content: POST,
    extensions: createPostEditorExtensions("내용을 입력해주세요"),
  });
  await act(async () => {
    root.render(
      // eslint-disable-next-line react/no-children-prop
      createElement(NextIntlClientProvider, {
        locale: "ko",
        messages: {},
        children: createElement(EditorContent, { editor }),
      }),
    );
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  editor.destroy();
  container.remove();
  vi.unstubAllGlobals();
});

function xPostPos(): number {
  let pos = -1;
  editor.state.doc.descendants((node, p) => {
    if (node.type.name === "xPost") pos = p;
  });
  return pos;
}

describe("XPostNodeView", () => {
  it("에디터 안에서 카드가 XPostEmbed 로 그려진다", () => {
    const embed = container.querySelector(".node-xPost .x-post-embed");
    expect(embed).not.toBeNull();
    const link = embed?.querySelector("a.x-post-embed__link");
    expect(link?.getAttribute("href")).toBe(POST);
  });

  it("클릭을 받는 덮개가 카드 위에 있다", () => {
    expect(
      container.querySelector(".node-xPost .x-post-node__shield"),
    ).not.toBeNull();
  });

  it("카드를 선택하면 바깥 node-xPost 요소에 선택 클래스가 붙는다", async () => {
    // postProse.css 의 선택 테두리 선택자가 기대는 요소다.
    await act(async () => {
      editor.commands.setNodeSelection(xPostPos());
    });
    expect(
      container.querySelector(".node-xPost.ProseMirror-selectednode"),
    ).not.toBeNull();
  });
});
