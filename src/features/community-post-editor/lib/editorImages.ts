import type { Editor } from "@tiptap/react";

/** Image 확장이 등록하는 노드 이름. */
const IMAGE_NODE = "image";

/**
 * 업로드가 끝난 이미지를 본문에 넣는다.
 *
 * 예전에는 `![](url)` 문자열을 textarea 의 `selectionStart` 자리에 끼워 넣었는데,
 * 이제는 노드를 넣는다. 앞 문장에 붙었는지 따져 개행을 덧대던 처리가 통째로 사라진다.
 */
export function insertImages(editor: Editor, urls: string[]): void {
  if (urls.length === 0) {
    return;
  }

  const nodes = urls.map((src) => ({ type: IMAGE_NODE, attrs: { src } }));

  // 첨부 버튼으로 올렸다면 에디터는 포커스를 잃은 상태이고, 그때 선택 위치는 문서
  // 맨 앞이다. 그대로 넣으면 글 첫머리에 이미지가 끼어든다.
  editor
    .chain()
    .focus(editor.isFocused ? null : "end")
    .insertContent(nodes)
    .run();
}

/**
 * 첨부 목록에서 뺀 이미지를 본문에서도 지운다.
 *
 * 이걸 하지 않으면 본문에는 URL 이 남고 목록에는 없는 상태가 되는데, 그 이미지는 글에
 * 붙지 않아 유예기간 뒤 파일이 사라진다 — 사용자에게는 <b>멀쩡히 저장한 글이 며칠 뒤
 * 깨지는</b> 것으로 보인다.
 *
 * <p>같은 URL 이 여러 번 들어가 있을 수 있어(복사-붙여넣기) 전부 지운다.
 */
export function removeImageByUrl(editor: Editor, url: string): void {
  const targets: Array<{ from: number; to: number }> = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === IMAGE_NODE && node.attrs.src === url) {
      targets.push({ from: pos, to: pos + node.nodeSize });
    }
  });

  if (targets.length === 0) {
    return;
  }

  const transaction = editor.state.tr;
  // 뒤에서부터 지워야 앞쪽 위치가 밀리지 않는다.
  for (const { from, to } of targets.reverse()) {
    transaction.delete(from, to);
  }
  editor.view.dispatch(transaction);
}
