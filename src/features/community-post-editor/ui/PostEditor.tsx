"use client";

import { EditorContent, type Editor } from "@tiptap/react";
import EditorToolbar from "./EditorToolbar";

interface PostEditorProps {
  editor: Editor | null;
  /** 업로드 중에는 문서가 곧 바뀌므로 편집을 막는다. */
  disabled?: boolean;
}

/**
 * 본문 편집 영역. 툴바와 편집 화면을 한 상자로 묶는다.
 *
 * <p>인스턴스를 여기서 만들지 않고 받는 이유는, 이미지 삽입·삭제를 폼이 직접 해야 하기
 * 때문이다(첨부 바의 X 버튼이 본문 속 이미지 노드를 지운다). 주인은 PostEditorForm 이다.
 */
export default function PostEditor({
  editor,
  disabled = false,
}: Readonly<PostEditorProps>) {
  return (
    <div className="post-editor flex flex-col rounded-lg border border-divider bg-surface-2 transition-colors focus-within:border-primary">
      <EditorToolbar editor={editor} disabled={disabled} />
      <div
        onDragOver={(event) => {
          // 막지 않으면 브라우저가 파일을 새 탭으로 열어 작성 중인 글이 날아간다.
          // 에디터 안에서 노드를 옮기는 드래그는 types 에 Files 가 없어 걸리지 않는다.
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
          }
        }}
        className="px-4 py-3.5"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
