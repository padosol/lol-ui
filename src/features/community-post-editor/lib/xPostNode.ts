import { Node, ReactNodeViewRenderer } from "@tiptap/react";
import type { MarkdownNodeSpec } from "tiptap-markdown";
import { matchBareXPostLink, parseXPostUrl } from "@/shared/lib/x-post";
import { XPostNodeView } from "../ui/XPostNodeView";

/**
 * 한 줄짜리 X 게시물 링크를 카드로 보여 주는 블록 노드.
 *
 * <p>저장 포맷은 새로 만들지 않는다. 노드는 마크다운에서 <b>URL 한 줄</b>로 쓰이고,
 * 읽을 때 "맨 URL 만 있는 최상위 문단"이면 노드가 된다. 뷰어(PostContent)가 같은 규칙으로
 * 카드를 그리므로, 이 규칙이 어긋나면 쓸 때와 볼 때의 글이 달라진다.
 *
 * <p>URL 은 원문 그대로 쓰고 읽는다. 정규화(`x.com` 통일 등)는 새로 넣을 때만 하고,
 * 왕복에서는 하지 않는다 — 열었다 저장하는 것만으로 저장된 글이 바뀌면 안 된다.
 *
 * <p>priority 는 기본값(100)이어야 한다. Paragraph(1000)보다 높이면 문서의 기본 블록이
 * 바뀌어 빈 줄에 엔터를 칠 때마다 카드가 생긴다.
 */
const markdown: MarkdownNodeSpec = {
  serialize(state, node) {
    // write 는 이스케이프하지 않는다. URL 의 `_` 나 `*` 가 `\_` 로 바뀌면 다른 주소가 된다.
    state.write(node.attrs.url as string);
    state.closeBlock(node);
  },
  parse: {
    updateDOM(element) {
      // element.children 은 최상위 블록뿐이다. 인용·목록 안의 링크는 여기 오지 않는다.
      for (const child of Array.from(element.children)) {
        if (child.tagName !== "P" || child.childNodes.length !== 1) continue;
        const link = child.firstElementChild;
        if (link?.tagName !== "A") continue;

        const href = link.getAttribute("href") ?? "";
        if (!matchBareXPostLink(href, link.textContent ?? "")) continue;

        const card = element.ownerDocument.createElement("div");
        card.setAttribute("data-x-post-url", href);
        child.replaceWith(card);
      }
    },
  },
};

export const XPost = Node.create({
  name: "xPost",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-x-post-url") ?? "",
        renderHTML: (attrs) => ({ "data-x-post-url": attrs.url as string }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-x-post-url]",
        // 붙여넣은 HTML 에서도 X 게시물이 아닌 주소(javascript: 등)는 노드가 되지 못하게 한다.
        getAttrs: (el) =>
          parseXPostUrl(el.getAttribute("data-x-post-url") ?? "") ? null : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", HTMLAttributes];
  },

  addStorage() {
    return { markdown };
  },

  addNodeView() {
    return ReactNodeViewRenderer(XPostNodeView);
  },
});
