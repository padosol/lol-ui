import Heading, { type Level } from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/react";

/**
 * 본문 제목을 한 단계 내려 h2~h4 로 렌더하는 Heading.
 *
 * 게시글 제목이 이미 페이지의 h1 이라(PostDetailPanel) 본문 제목까지 h1 이면 한 문서에
 * h1 이 둘이 된다. 뷰어(PostContent)는 예전부터 한 단계 내려 렌더해 왔으므로, 에디터도
 * 같은 태그를 내야 한다 — <b>쓰는 화면이 곧 보이는 화면</b>인 것이 WYSIWYG 의 전부다.
 *
 * <p>마크다운은 영향을 받지 않는다. 직렬화는 태그가 아니라 {@code level} 속성을 보므로
 * level 1 은 여전히 `#` 으로 저장된다.
 *
 * <h2>parseHTML 은 건드리지 않는다</h2>
 * 대칭을 맞추려고 parseHTML 까지 한 단계 내리면 <b>마크다운 읽기가 깨진다</b>. 입력
 * 경로가 마크다운 → HTML → ProseMirror 이기 때문이다: `#` 은 `<h1>` 로 오는데 규칙이
 * h2 부터 시작하면 `<h1>` 은 아무 규칙에도 걸리지 않아 <b>문단으로 떨어지고</b>, `##`
 * 이 만든 `<h2>` 가 level 1 로 붙어 제목 단계가 통째로 한 칸씩 밀린다.
 *
 * <p>에디터 안에서의 복사-붙여넣기는 이것 때문에 깨지지 않는다. ProseMirror 가 클립보드에
 * `data-pm-slice` 로 원본 조각을 함께 실어 보내고, 같은 에디터에 붙일 때는 그것을 그대로
 * 복원하기 때문이다. 밖에서 가져온 `<h2>` 가 level 2 로 붙는 것은 오히려 자연스럽다.
 */
const DEMOTION = 1;

export const PostHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const levels = this.options.levels as Level[];
    const level: Level = levels.includes(node.attrs.level)
      ? node.attrs.level
      : levels[0];

    return [
      `h${level + DEMOTION}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});
