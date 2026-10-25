import { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { createPostEditorExtensions } from "../model/postEditorExtensions";
import { collectImageUrls, insertImages, removeImageByUrl } from "./editorImages";

/**
 * 첨부 목록이 본문을 따라가는지 본다.
 *
 * <p>첨부와 본문은 <b>URL 문자열 완전 일치</b>로 이어져 있다. 서버가 키를
 * `keyRoot/YYYY/MM/uuid.ext` 로만 만들고 원본 파일명을 쓰지 않기 때문에 성립하는
 * 가정인데, 어긋나면 이미지가 조용히 첨부에서 빠져 저장된 뒤 유예가 지나 사라진다.
 */
const PLACEHOLDER = "내용을 입력해주세요";
const BASE = "https://static.metapick.me/community-dev/2026/08";
const FIRST = `${BASE}/0d5a1f6e-2c47-4b8a-9f31-7ac05e6b12d4.png`;
const SECOND = `${BASE}/9b3c8d21-5e70-42af-8c16-3f0a94d7e5b8.webp`;

function open(markdown: string): Editor {
  return new Editor({
    content: markdown,
    extensions: createPostEditorExtensions(PLACEHOLDER),
  });
}

describe("본문 이미지 수집", () => {
  it("마크다운의 URL 을 한 글자도 바꾸지 않고 돌려준다", () => {
    // 여기가 어긋나면 첨부 목록이 본문의 이미지를 못 알아본다.
    const editor = open(`글\n\n![](${FIRST})`);

    expect(collectImageUrls(editor)).toEqual([FIRST]);

    editor.destroy();
  });

  it("이미지가 없으면 빈 목록이다", () => {
    const editor = open("이미지 없는 글");

    expect(collectImageUrls(editor)).toEqual([]);

    editor.destroy();
  });

  it("같은 이미지가 여러 번 있어도 한 번만 센다", () => {
    // 복사-붙여넣기로 같은 URL 이 두 번 들어가도 첨부는 한 장이다.
    const editor = open(`![](${FIRST})\n\n사이 글\n\n![](${FIRST})`);

    expect(collectImageUrls(editor)).toEqual([FIRST]);

    editor.destroy();
  });

  it("순서를 바꿔도 결과가 같다", () => {
    // 이 값이 바뀌는 것이 곧 첨부 목록을 다시 그리는 신호다. 위아래로 옮기기만 한
    // 경우까지 값이 달라지면 이유 없이 다시 그린다.
    const editor = open(`![](${FIRST})\n\n![](${SECOND})`);
    const swapped = open(`![](${SECOND})\n\n![](${FIRST})`);

    expect(collectImageUrls(editor)).toEqual(collectImageUrls(swapped));

    editor.destroy();
    swapped.destroy();
  });
});

describe("본문에서 지워진 이미지", () => {
  it("수집 결과에서 사라진다", () => {
    // 첨부 목록과 저장할 imageIds 가 모두 이 신호를 보고 판단한다.
    const editor = open(`![](${FIRST})\n\n![](${SECOND})`);

    removeImageByUrl(editor, FIRST);

    expect(collectImageUrls(editor)).toEqual([SECOND]);

    editor.destroy();
  });

  it("같은 URL 이 여러 벌이면 전부 사라진다", () => {
    const editor = open(`![](${FIRST})\n\n글\n\n![](${FIRST})`);

    removeImageByUrl(editor, FIRST);

    expect(collectImageUrls(editor)).toEqual([]);

    editor.destroy();
  });
});

describe("업로드 직후 삽입", () => {
  it("넣은 이미지가 곧바로 수집된다", () => {
    // 넣자마자 잡히지 않으면 업로드해도 첨부 목록에 안 뜬다.
    const editor = open("먼저 쓴 글");

    insertImages(editor, [FIRST, SECOND]);

    expect(collectImageUrls(editor)).toEqual([FIRST, SECOND].sort());

    editor.destroy();
  });
});
