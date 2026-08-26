"use client";

import { useMemo } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { collectImageUrls } from "../lib/editorImages";

/** 정렬된 URL 을 원시값 하나로 눌러 담을 때 쓰는 구분자. URL 안에는 나올 수 없다. */
const SEPARATOR = "\n";

/**
 * 본문에 실제로 남아 있는 이미지 URL 집합. 에디터가 아직 없으면 `null`.
 *
 * ## `null` 과 빈 집합은 뜻이 다르다
 * 빈 집합은 "본문에 이미지가 하나도 없다"이고 `null` 은 "아직 모른다"이다. SSR 때문에
 * `immediatelyRender` 를 꺼 둬서 첫 렌더에는 에디터가 없는데, 그때 빈 집합으로 취급하면
 * 수정 화면에서 이미 붙어 있던 첨부가 한 프레임 사라졌다 돌아온다.
 *
 * ## 선택자가 문자열을 내놓는 이유
 * 집합을 그대로 돌려주면 트랜잭션마다 새 객체라 글자를 칠 때마다 폼 전체가 다시 그려진다.
 * 원시값이면 실제로 이미지가 늘거나 줄었을 때만 다시 그린다.
 */
export function useDocumentImageUrls(
  editor: Editor | null
): ReadonlySet<string> | null {
  const joined = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current ? collectImageUrls(current).join(SEPARATOR) : null,
  });

  return useMemo(() => {
    if (joined == null) {
      return null;
    }
    return new Set(joined.length > 0 ? joined.split(SEPARATOR) : []);
  }, [joined]);
}
