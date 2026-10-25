import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";
import type { Editor, Extensions } from "@tiptap/react";
import { PostHeading } from "../lib/postHeading";

/**
 * 마크다운 입출력 설정. <b>기본값 두 개가 이 기능의 성패를 가른다.</b>
 */
export const MARKDOWN_OPTIONS = {
  /**
   * 기본값은 true 다. 켜 두면 마크다운 속 원시 HTML 을 에디터가 파싱하고 저장할 때
   * 다시 뱉는다 — PostContent 가 rehype-raw 를 일부러 빼서 막아 둔 경로가 에디터를
   * 통해 열린다. 뷰어가 문자로만 취급하는 것을 에디터가 태그로 바꿔 저장하면 방어선이
   * 통째로 무의미해진다.
   */
  html: false,
  /**
   * 기본값은 false 다. 뷰어가 remark-breaks 를 쓰므로 홑 줄바꿈은 `<br>` 이어야 한다.
   * 끄면 에디터에서 줄을 바꿔 둔 글이 저장 뒤 한 문단으로 합쳐진다 — 에디터에서 본
   * 것과 글이 달라지므로 WYSIWYG 자체가 성립하지 않는다.
   */
  breaks: true,
  /** 뷰어의 remark-gfm 이 맨 URL 을 자동 링크한다. 에디터도 같게 본다. */
  linkify: true,
} as const;

/**
 * 본문 에디터가 쓰는 확장 목록.
 *
 * <p>훅에서 떼어 낸 이유는 이 목록이 곧 <b>저장 포맷의 정의</b>이기 때문이다. React 없이
 * 그대로 불러 마크다운 왕복을 검증할 수 있어야 한다.
 */
export function createPostEditorExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      // PostHeading 으로 갈아끼운다.
      heading: false,
      // 마크다운에 밑줄 문법이 없다. 켜 두면 툴바로 밑줄을 그어도 저장하는 순간
      // 조용히 사라진다 — 없는 편이 낫다.
      underline: false,
      link: {
        // 편집 중 링크 클릭은 이동이 아니라 커서 이동이어야 한다.
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      },
    }),
    PostHeading.configure({ levels: [1, 2, 3] }),
    Image.configure({
      /*
       * 블록이 아니라 인라인이어야 한다. 블록으로 두면 마크다운으로 뽑을 때 다음 블록과
       * 사이에 빈 줄이 들어가지 않아 `![](url)아래 문단` 처럼 붙어 나오고, 뷰어는 그것을
       * 한 문단으로 읽어 이미지 옆에 글이 흐른다. 인라인이면 이미지가 문단 안에 들어가
       * 문단 구분이 정상적으로 찍힌다 — 예전 textarea 가 만들던 `\n![](url)\n` 과도 같다.
       */
      inline: true,
      // data: URI 가 본문에 통째로 박히는 경로를 막는다. 이미지는 언제나 업로드를
      // 거쳐 CDN URL 로만 들어와야 서버가 수명을 관리할 수 있다.
      allowBase64: false,
    }),
    Placeholder.configure({ placeholder }),
    // TrailingNode(마지막 블록이 이미지일 때 그 뒤에 커서 둘 자리를 만들어 주는 확장)를
    // 여기 더하면 안 된다. StarterKit 이 이미 켜 두었고, 두 번 등록하면 ProseMirror 가
    // "Adding different instances of a keyed plugin" 으로 <b>에디터 생성 자체를 실패</b>시킨다.
    CharacterCount,
    Markdown.configure(MARKDOWN_OPTIONS),
  ];
}

/**
 * 현재 문서를 마크다운으로 뽑는다.
 *
 * <p>tiptap-markdown 은 확장을 등록하면서도 Tiptap 의 `Storage` 인터페이스를 넓히지
 * 않는다. 그래서 `editor.storage.markdown` 이 타입에 없다 — 캐스팅을 여기 하나에 가둔다.
 *
 * <p>빈 문서도 마크다운으로는 공백이 남을 수 있다. 그대로 흘리면 "내용을 입력해주세요"
 * 검증이 통과해 빈 글이 저장된다.
 */
export function toMarkdown(editor: Editor): string {
  if (editor.isEmpty) {
    return "";
  }
  const storage = editor.storage as unknown as { markdown: MarkdownStorage };
  return storage.markdown.getMarkdown().trim();
}
