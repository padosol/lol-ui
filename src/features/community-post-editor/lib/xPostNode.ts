import { Node, ReactNodeViewRenderer } from "@tiptap/react";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
  type EditorState,
} from "@tiptap/pm/state";
import type { MarkdownNodeSpec } from "tiptap-markdown";
import { matchBareXPostLink, parseXPostUrl } from "@/shared/lib/x-post";
import { XPostNodeView } from "../ui/XPostNodeView";

/**
 * markdown-it 은 링크 <b>글자</b>만 퍼센트 디코딩해 보여 준다(`…twsrc%5Etfw` → `…twsrc^tfw`).
 * href 는 원문 그대로다. 뷰어(remark-gfm)는 글자도 원문이라 맨 URL 로 본다. 글자가 디코딩한
 * href 와 같으면 맨 URL 로 쳐서 양쪽 판정을 맞춘다. 노드에는 원문 href 를 담아 왕복이 원문 그대로다.
 */
function shownAsHref(href: string, text: string): string {
  try {
    return decodeURI(href) === text.trim() ? href : text;
  } catch {
    // 잘못된 퍼센트 인코딩(`%E2%9C` 같은)은 디코딩을 포기하고 글자 그대로 비교한다.
    return text;
  }
}

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
        if (!matchBareXPostLink(href, shownAsHref(href, link.textContent ?? ""))) continue;

        const card = element.ownerDocument.createElement("div");
        card.setAttribute("data-x-post-url", href);
        child.replaceWith(card);
      }
    },
  },
};

/**
 * 커서가 있는 문단을 [카드, 빈 문단] 으로 바꾸고 커서를 새 문단에 둔다.
 *
 * <p>한 트랜잭션이라 "링크 문단" 같은 중간 단계로 되돌아가는 일은 없다. 다만 history 는
 * 직전 입력과 이어지는 변경을 500ms(newGroupDelay) 안이면 한 묶음으로 친다. URL 을 치고 곧바로
 * Enter 를 누르면 Ctrl+Z 한 번에 카드와 함께 친 글자도 되돌아간다.
 */
function replaceWithCard(state: EditorState, url: string) {
  const { $from } = state.selection;
  const { schema } = state;
  const card = schema.nodes.xPost.create({ url });
  const tr = state.tr.replaceWith($from.before(), $from.after(), [
    card,
    schema.nodes.paragraph.create(),
  ]);
  return tr.setSelection(TextSelection.create(tr.doc, $from.before() + card.nodeSize + 1));
}

/**
 * 선택한 최상위 카드를 새 카드로 바꾸고 커서를 카드 뒤 문단에 둔다. 뒤가 문단이 아니면 빈 문단을 만든다.
 * 붙여넣은 뒤 카드가 선택된 채 남으면 다음 글자가 카드를 지운다.
 */
function replaceSelectedCard(state: EditorState, selection: NodeSelection, url: string) {
  const { schema } = state;
  const card = schema.nodes.xPost.create({ url });
  const tr = state.tr.replaceWith(selection.from, selection.to, card);
  const after = selection.from + card.nodeSize;
  if (tr.doc.resolve(after).nodeAfter?.type.name !== "paragraph") {
    tr.insert(after, schema.nodes.paragraph.create());
  }
  return tr.setSelection(TextSelection.create(tr.doc, after + 1));
}

/**
 * 문서 바로 아래가 아닌 카드를 "링크 걸린 URL 한 줄" 문단으로 바꾼다. 바꿀 게 없으면 null.
 *
 * <p>카드는 블록이라 인용·목록 안에도 들어갈 수 있다(선택한 카드에 인용 버튼, 전체 선택 뒤
 * 목록, 인용 안에 붙여넣기·끌어 놓기). 그 자리의 X 링크는 뷰어에서 카드가 아니라 링크다(최상위 규칙).
 * 그래서 들어가는 즉시 저장된 마크다운을 다시 열었을 때와 같은 모양, 곧 링크 문단으로 바꾼다.
 * 인용·목록 동작은 막지 않는다.
 */
function unnestCards(state: EditorState) {
  const { doc, schema } = state;
  const nested: { pos: number; url: string; size: number }[] = [];
  doc.descendants((node, pos, parent) => {
    if (node.type.name === "xPost") {
      if (parent !== doc) nested.push({ pos, url: node.attrs.url as string, size: node.nodeSize });
      return false;
    }
    // 글자 블록(문단·제목·코드) 안에는 블록이 없다. 블록을 담는 노드만 내려간다.
    return !node.isTextblock;
  });
  if (nested.length === 0) return null;

  const tr = state.tr;
  // 뒤에서부터 바꿔야 앞쪽 위치가 밀리지 않는다.
  for (const { pos, url, size } of nested.reverse()) {
    const text = url ? schema.text(url, [schema.marks.link.create({ href: url })]) : null;
    tr.replaceWith(pos, pos + size, schema.nodes.paragraph.create(null, text));
  }
  return tr;
}

/**
 * 붙여넣기와 Enter 가 함께 쓰는 공통 전제: 최상위 문단 안의 빈 선택이다.
 *
 * <p>목록·인용문 안(depth > 1)이나 제목에서는 카드를 넣지 않는다. 최상위 문단이 아니면
 * 마크다운으로 쓸 때 "URL 한 줄" 규칙을 지킬 수 없어, 저장했다 열면 카드가 사라진다.
 * 선택이 비어 있지 않으면 비켜서 Link 의 "선택한 글자에 링크 걸기"가 동작하게 둔다.
 */
function topLevelParagraph(state: EditorState) {
  const { selection } = state;
  if (!selection.empty) return null;
  const { $from } = selection;
  if ($from.depth !== 1 || $from.parent.type.name !== "paragraph") return null;
  return $from;
}

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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("xPostTopLevelOnly"),
        // 문서를 바꾼 트랜잭션 뒤에만 본다. 선택만 바뀐 트랜잭션에 아무것도 덧붙이지 않아야
        // 본문을 안 만진 수정에서 문서가 그대로다(markdownChangeListener 참고).
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null;
          return unnestCards(newState);
        },
      }),
      new Plugin({
        key: new PluginKey("xPostPaste"),
        props: {
          handlePaste(view, _event, slice) {
            const ref = parseXPostUrl(
              slice.content.textBetween(0, slice.content.size, "\n").trim()
            );
            if (!ref) return false;
            const { state } = view;

            // 최상위 카드를 선택하고 X 주소를 붙여넣으면 카드를 갈아끼운다.
            const { selection } = state;
            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === "xPost" &&
              selection.$from.depth === 0
            ) {
              view.dispatch(
                replaceSelectedCard(state, selection, ref.canonicalUrl).scrollIntoView()
              );
              return true;
            }

            const $from = topLevelParagraph(state);
            if (!$from) return false;

            if ($from.parent.content.size === 0) {
              view.dispatch(replaceWithCard(state, ref.canonicalUrl).scrollIntoView());
              return true;
            }
            // 글자가 있는 문단은 커서 자리에서 나눠 넣는다. 한 트랜잭션이라 붙여넣기 전체가 한 번에 되돌아간다.
            // insertContent 는 쓰지 않는다: 문단 끝에서는 카드가 선택된 채 끝나, 다음 글자가 카드를 지운다.
            const card = state.schema.nodes.xPost.create({ url: ref.canonicalUrl });
            const tr = state.tr;
            if ($from.pos === $from.start()) {
              // 맨 앞: 빈 문단을 남기지 않고 카드만 앞에 넣는다. 커서는 원래 글 앞에 둔다.
              tr.insert($from.before(), card);
              tr.setSelection(TextSelection.create(tr.doc, $from.pos + card.nodeSize));
            } else {
              // 가운데·끝: 문단을 나눠 그 사이에 카드를 넣고, 커서는 카드 뒤 문단에 둔다.
              tr.split($from.pos);
              const boundary = $from.pos + 1;
              tr.insert(boundary, card);
              tr.setSelection(TextSelection.create(tr.doc, boundary + card.nodeSize + 1));
            }
            view.dispatch(tr.scrollIntoView());
            return true;
          },
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const $from = topLevelParagraph(state);
        if (!$from) return false;

        // 이미지 같은 인라인 노드가 섞인 문단은 글자가 아니므로 건드리지 않는다.
        // 글자와 다른 곳을 가리키는 링크(`[x 주소](다른 주소)`)도 건드리지 않는다. 카드로 바꾸면 그 href 가 사라진다.
        const { link } = state.schema.marks;
        let plainUrl = true;
        $from.parent.forEach((child) => {
          const href = link.isInSet(child.marks)?.attrs.href as string | undefined;
          if (!child.isText || (href !== undefined && href !== child.text)) plainUrl = false;
        });
        if (!plainUrl) return false;

        const ref = parseXPostUrl($from.parent.textContent.trim());
        if (!ref) return false;

        editor.view.dispatch(replaceWithCard(state, ref.canonicalUrl).scrollIntoView());
        return true;
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(XPostNodeView);
  },
});
