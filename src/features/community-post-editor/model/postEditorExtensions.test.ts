import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { createPostEditorExtensions, toMarkdown } from "./postEditorExtensions";

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
