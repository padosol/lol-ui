"use client";

import { useEditor, type Editor } from "@tiptap/react";
import { createPostEditorExtensions, toMarkdown } from "./postEditorExtensions";

interface UsePostEditorOptions {
  /** 최초 1회만 쓰인다. 이후 값을 되먹이면 커서가 튄다. */
  initialMarkdown: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (markdown: string) => void;
  onImageFiles: (files: File[]) => void;
}

/**
 * 게시글 본문 에디터 인스턴스.
 *
 * ## 값의 주인은 에디터다
 * react-hook-form 이 아니라 에디터가 본문을 들고 있고, 바뀔 때만
 * {@link UsePostEditorOptions.onChange} 로 마크다운을 흘려보낸다. 반대 방향
 * (폼 값 → 에디터)은 <b>없다</b> — 되먹이면 매 입력마다 문서를 다시 만들어 커서가
 * 맨 앞으로 튄다.
 *
 * <p>이 단방향에는 곁다리 이득이 하나 있다. 수정 화면에서 본문을 건드리지 않으면
 * onChange 가 한 번도 불리지 않으므로 <b>원문 문자열이 그대로 저장된다</b>. 제목만
 * 고치는 수정에서 마크다운 재직렬화로 본문이 미묘하게 달라지는 사고가 원천적으로 막힌다.
 */
export function usePostEditor({
  initialMarkdown,
  placeholder,
  ariaLabel,
  onChange,
  onImageFiles,
}: UsePostEditorOptions): Editor | null {
  return useEditor({
    // Next.js SSR 에서 첫 렌더를 서버와 맞추려면 꺼야 한다. 켜 두면 hydration 불일치가 난다.
    immediatelyRender: false,
    content: initialMarkdown,
    extensions: createPostEditorExtensions(placeholder),
    editorProps: {
      attributes: {
        // 본문 타이포그래피를 뷰어와 공유한다(shared/styles/postProse.css).
        class: "post-prose",
        "aria-label": ariaLabel,
      },
      handlePaste: (_view, event) => {
        // 스크린샷 붙여넣기. 파일이 없으면 평범한 텍스트라 기본 동작에 맡긴다.
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.length === 0) {
          return false;
        }
        onImageFiles(files);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        // moved 는 에디터 안에서 노드를 옮기는 중이라는 뜻이다. 가로채면 안 된다.
        if (moved) {
          return false;
        }
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (files.length === 0) {
          return false;
        }
        event.preventDefault();
        onImageFiles(files);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(toMarkdown(editor)),
  });
}
