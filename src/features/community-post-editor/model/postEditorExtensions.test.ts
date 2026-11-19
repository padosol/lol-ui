import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Editor } from "@tiptap/react";
import { DOMParser, Fragment, Slice } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { describe, expect, it, vi } from "vitest";
import {
  createPostEditorExtensions,
  markdownChangeListener,
  toMarkdown,
} from "./postEditorExtensions";

/**
 * 에디터가 마크다운을 읽어 들이고 다시 뱉었을 때 글이 보존되는지 본다.
 *
 * <p>이 파일이 있는 이유는 여기가 조용히 깨지는 자리이기 때문이다. 타입도 빌드도
 * 통과하면서 <b>글만 망가진다</b>. 실제로 이 테스트를 처음 돌렸을 때 세 가지가 잡혔다:
 * StarterKit 이 이미 켠 TrailingNode 를 두 번 등록해 에디터 생성이 통째로 실패했고,
 * 이미지가 블록이라 뒤 문단이 달라붙었고, 제목 parseHTML 을 손대 `#` 이 문단이 됐다.
 */
const PLACEHOLDER = "내용을 입력해주세요";
const IMAGE_URL = "https://static.metapick.me/community-dev/2026/08/a.png";
const POST = "https://x.com/LoLDev/status/1234567890123456789";

function hasXPost(editor: Editor): boolean {
  let found = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === "xPost") found = true;
  });
  return found;
}

/** 기본 붙여넣기 처리기가 없어 아무도 안 받으면 undefined 다. */
function paste(editor: Editor, text: string): boolean | void {
  return editor.view.someProp("handlePaste", (f) =>
    f(
      editor.view,
      new Event("paste") as ClipboardEvent,
      new Slice(Fragment.from(editor.schema.text(text)), 0, 0)
    )
  );
}

/** insertContent 는 tiptap-markdown 이 마크다운으로 파싱하므로 쓰지 않는다. */
function typeRaw(editor: Editor, text: string) {
  editor.view.dispatch(editor.state.tr.insertText(text));
}

function open(markdown: string): Editor {
  return new Editor({
    content: markdown,
    extensions: createPostEditorExtensions(PLACEHOLDER),
  });
}

function roundTrip(markdown: string): string {
  const editor = open(markdown);
  const output = toMarkdown(editor);
  editor.destroy();
  return output;
}

/** PostContent 와 같은 플러그인 구성으로 렌더한다. */
function renderAsViewer(markdown: string): string {
  return renderToStaticMarkup(
    createElement(
      ReactMarkdown,
      { remarkPlugins: [remarkGfm, remarkBreaks] },
      markdown
    )
  );
}

describe("마크다운 왕복", () => {
  it.each([
    ["문단 구분", "첫 문단\n\n둘째 문단"],
    ["이미지", `![](${IMAGE_URL})`],
    ["굵게·기울임·취소선", "**굵게** *기울임* ~~취소~~"],
    ["글머리 목록", "- 하나\n- 둘"],
    ["번호 목록", "1. 하나\n2. 둘"],
    ["인용", "> 인용문"],
    ["코드블록", "```\ncode()\n```"],
    ["인라인 코드", "`inline`"],
    ["구분선", "---"],
  ])("%s 은 그대로 돌아온다", (_name, markdown) => {
    expect(roundTrip(markdown)).toBe(markdown);
  });

  it("이미지 뒤 문단이 달라붙지 않는다", () => {
    // Image 를 블록으로 두면 `![](url)아래 문단` 으로 붙어 나와 뷰어가 한 문단으로 읽는다.
    const markdown = `위 문단\n\n![](${IMAGE_URL})\n\n아래 문단`;

    expect(roundTrip(markdown)).toBe(markdown);
  });

  it("제목은 단계를 유지한다", () => {
    // parseHTML 까지 한 단계 내리면 `#` 이 문단으로 떨어지고 나머지가 한 칸씩 밀린다.
    expect(roundTrip("# 하나\n\n## 둘\n\n### 셋")).toBe("# 하나\n\n## 둘\n\n### 셋");
  });
});

describe("뷰어와의 약속", () => {
  it("제목 태그가 뷰어와 같은 h2~h4 다", () => {
    // 게시글 제목이 페이지의 h1 이라 본문 제목은 한 단계 내려 쓴다(PostContent 와 동일).
    const editor = open("# 하나\n\n## 둘\n\n### 셋");
    const html = editor.getHTML();
    editor.destroy();

    expect(html).toBe("<h2>하나</h2><h3>둘</h3><h4>셋</h4>");
  });

  it("평문 줄바꿈은 표기가 바뀌어도 같은 글로 보인다", () => {
    // 평문 시절 글을 열었다 저장하면 홑 줄바꿈이 마크다운 하드브레이크(`\` + 개행)로
    // 다시 쓰인다. 저장된 문자열은 바뀌지만 뷰어가 내는 HTML 은 같아야 한다.
    const stored = "첫 줄\n둘째 줄\n셋째 줄";
    const rewritten = roundTrip(stored);

    expect(rewritten).not.toBe(stored);
    expect(renderAsViewer(rewritten)).toBe(renderAsViewer(stored));
  });

  it("한 번 더 왕복해도 더는 바뀌지 않는다", () => {
    const once = roundTrip("첫 줄\n둘째 줄");

    expect(roundTrip(once)).toBe(once);
  });
});

describe("원시 HTML", () => {
  it("태그로 살아나지 않는다", () => {
    // PostContent 가 rehype-raw 를 빼서 막아 둔 경로를 에디터가 열어 주면 안 된다.
    const editor = open('<script>alert(1)</script><img src=x onerror=alert(1)>');
    const html = editor.getHTML();
    editor.destroy();

    expect(html).not.toMatch(/<script|<img/i);
  });
});

describe("X 게시물", () => {
  it.each([
    ["단독 줄", POST],
    ["앞뒤 문단과 함께", `패치 요약\n\n${POST}\n\n아래 문단`],
    ["쿼리 붙은 원문은 원문 그대로", `${POST}?s=20&t=abc`],
    ["twitter.com 원문 그대로", "https://twitter.com/LoLDev/status/1"],
    ["이미지와 함께", `![](${IMAGE_URL})\n\n${POST}`],
  ])("%s 은 노드로 읽히고 그대로 돌아온다", (_name, md) => {
    const editor = open(md);
    expect(hasXPost(editor)).toBe(true);
    expect(toMarkdown(editor)).toBe(md);
    editor.destroy();
  });

  it.each([
    ["문장 속", `출처 ${POST} 참고`],
    ["텍스트를 단 링크", `[출처](${POST})`],
    ["인용문 안", `> ${POST}`],
    ["목록 안", `- ${POST}`],
  ])("%s 의 X 링크는 노드가 되지 않는다", (_name, md) => {
    const editor = open(md);
    expect(hasXPost(editor)).toBe(false);
    editor.destroy();
  });

  it("X 게시물만 있는 글은 빈 글이 아니다", () => {
    const editor = open(POST);
    expect(toMarkdown(editor)).toBe(POST);
    editor.destroy();
  });

  it("parseHTML 은 X 가 아닌 URL 을 거부한다", () => {
    // setContent 는 tiptap-markdown 이 마크다운으로 먼저 파싱해(html: false) HTML 이 글자가 된다.
    // 그러면 getAttrs 가 없어도 통과하는 빈 테스트가 된다. ProseMirror 파서로 직접 넣는다(붙여넣은 HTML 경로와 같다).
    const editor = open("");
    const dom = document.createElement("div");
    dom.innerHTML =
      '<div data-x-post-url="javascript:alert(1)"></div>' +
      '<div data-x-post-url="https://example.com/a"></div>' +
      `<div data-x-post-url="${POST}"></div>`;
    const doc = DOMParser.fromSchema(editor.schema).parse(dom);
    const urls: string[] = [];
    doc.descendants((node) => {
      if (node.type.name === "xPost") urls.push(node.attrs.url);
    });
    expect(urls).toEqual([POST]); // 마지막 것만 노드가 된다 — getAttrs 가 실제로 걸러냈다는 증거
    editor.destroy();
  });

  it("문서 기본 블록은 여전히 paragraph 다", () => {
    const editor = open("");
    expect(editor.schema.topNodeType.contentMatch.defaultType?.name).toBe("paragraph");
    editor.destroy();
  });

  it("뷰어가 보는 글과 에디터를 거친 글이 같다", () => {
    const md = `요약\n\n${POST}\n\n아래`;
    expect(renderAsViewer(toMarkdown(open(md)))).toBe(renderAsViewer(md));
  });
});

describe("X 게시물 넣기", () => {
  it("빈 문단에 붙여넣으면 표준형 노드가 된다", () => {
    const editor = open("");
    editor.commands.focus("start");
    paste(editor, `  ${POST}?s=20&t=abc  `);
    expect(toMarkdown(editor)).toBe(POST);
    editor.destroy();
  });

  it("글자 사이에 붙여넣으면 문단을 나눠 넣는다", () => {
    const editor = open("앞뒤");
    editor.commands.setTextSelection(2); // "앞|뒤"
    paste(editor, POST);
    expect(toMarkdown(editor)).toBe(`앞\n\n${POST}\n\n뒤`);
    editor.destroy();
  });

  it("글자를 선택하고 붙여넣으면 선택한 글자에 링크가 걸린다", () => {
    const editor = open("출처");
    editor.commands.setTextSelection({ from: 1, to: 3 });
    paste(editor, POST);
    expect(hasXPost(editor)).toBe(false);
    expect(toMarkdown(editor)).toBe(`[출처](${POST})`);
    editor.destroy();
  });

  it.each([
    ["목록 안", "- 항목"],
    ["인용문 안", "> 인용"],
    ["제목 안", "# 제목"],
  ])("%s 에 붙여넣으면 노드가 되지 않는다", (_name, md) => {
    const editor = open(md);
    editor.commands.focus("end");
    paste(editor, POST);
    expect(hasXPost(editor)).toBe(false);
    editor.destroy();
  });

  it("X 가 아닌 URL 을 붙여넣으면 노드가 되지 않는다", () => {
    const editor = open("");
    editor.commands.focus("start");
    paste(editor, "https://example.com/a");
    expect(hasXPost(editor)).toBe(false);
    editor.destroy();
  });

  it("URL 만 친 문단에서 Enter 를 누르면 노드로 바뀐다", () => {
    const editor = open("");
    editor.commands.focus("start");
    typeRaw(editor, `${POST}?s=20`);
    editor.commands.keyboardShortcut("Enter");
    expect(toMarkdown(editor)).toBe(POST);
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");
    editor.destroy();
  });

  it("이미지가 섞인 문단은 Enter 로 바꾸지 않는다", () => {
    const editor = open(`![](${IMAGE_URL})`);
    editor.commands.focus("end");
    typeRaw(editor, POST);
    editor.commands.keyboardShortcut("Enter");
    expect(hasXPost(editor)).toBe(false);
    expect(toMarkdown(editor)).toContain(IMAGE_URL);
    editor.destroy();
  });

  it("글자와 URL 이 섞인 문단은 Enter 로 바꾸지 않는다", () => {
    const editor = open("");
    editor.commands.focus("start");
    typeRaw(editor, `출처 ${POST}`);
    editor.commands.keyboardShortcut("Enter");
    expect(hasXPost(editor)).toBe(false);
    editor.destroy();
  });

  it("글 끝에 붙여넣으면 카드 뒤 문단에 커서가 가고 다음 글자가 카드를 지우지 않는다", () => {
    const editor = open("abc");
    editor.commands.focus("end");
    paste(editor, POST);
    expect(hasXPost(editor)).toBe(true);
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");
    typeRaw(editor, "Z");
    expect(toMarkdown(editor)).toBe(`abc\n\n${POST}\n\nZ`);
    editor.destroy();
  });

  it("다음 문단이 있는 글 끝에 붙여넣어도 카드가 남는다", () => {
    const editor = open("abc\n\nnext");
    editor.commands.setTextSelection(4); // "abc|"
    paste(editor, POST);
    typeRaw(editor, "Z");
    expect(hasXPost(editor)).toBe(true);
    expect(toMarkdown(editor)).toBe(`abc\n\n${POST}\n\nZ\n\nnext`);
    editor.destroy();
  });

  it("글 맨 앞에 붙여넣으면 카드가 앞에 들어가고 커서는 원래 글 앞에 있다", () => {
    const editor = open("abc");
    editor.commands.setTextSelection(1);
    paste(editor, POST);
    typeRaw(editor, "Z");
    expect(toMarkdown(editor)).toBe(`${POST}\n\nZabc`);
    editor.destroy();
  });

  it("글 가운데에 붙여넣으면 커서가 뒤 글 앞에 있다", () => {
    const editor = open("앞뒤");
    editor.commands.setTextSelection(2);
    paste(editor, POST);
    typeRaw(editor, "Z");
    expect(toMarkdown(editor)).toBe(`앞\n\n${POST}\n\nZ뒤`);
    editor.destroy();
  });

  it("붙여넣기는 Ctrl+Z 한 번에 되돌아간다", () => {
    const editor = open("abc");
    editor.commands.focus("end");
    paste(editor, POST);
    editor.commands.undo();
    expect(toMarkdown(editor)).toBe("abc");
    expect(hasXPost(editor)).toBe(false);
    editor.destroy();
  });
});

describe("수정 화면 단방향 원칙", () => {
  function openWithListener(markdown: string) {
    const onChange = vi.fn();
    const editor = new Editor({
      content: markdown,
      extensions: createPostEditorExtensions(PLACEHOLDER),
      onUpdate: markdownChangeListener(onChange),
    });
    return { editor, onChange };
  }

  it("카드로 끝나는 글은 선택만 바꿔도 onChange 가 불리지 않는다", () => {
    const { editor, onChange } = openWithListener(`요약\n\n${POST}`);
    // 전제: 아직 빈 문단이 덧붙지 않았다. 생성 중에 이미 붙었다면 이 테스트는 그 경로를 지나지 않는다.
    expect(editor.state.doc.lastChild?.type.name).toBe("xPost");
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1)));
    // TrailingNode 가 실제로 빈 문단을 덧붙였는지 먼저 확인한다 — 그래야 이 테스트가 그 경로를 지난다.
    expect(editor.state.doc.lastChild?.type.name).toBe("paragraph");
    expect(onChange).not.toHaveBeenCalled();
    editor.destroy();
  });

  it("setEditable 만으로는 onChange 가 불리지 않는다", () => {
    const { editor, onChange } = openWithListener(`요약\n\n${POST}`);
    editor.setEditable(false);
    expect(onChange).not.toHaveBeenCalled();
    editor.destroy();
  });

  it("실제로 글을 고치면 onChange 가 불린다", () => {
    const { editor, onChange } = openWithListener("요약");
    editor.commands.focus("end");
    editor.view.dispatch(editor.state.tr.insertText("!"));
    expect(onChange).toHaveBeenLastCalledWith("요약!");
    editor.destroy();
  });
});
