import { matchBareXPostLink } from "@/shared/lib/x-post";

// hast 타입 패키지는 직접 의존성이 아니라 import 할 수 없다. 이 플러그인이 읽는
// 필드만 구조적으로 선언한다.
interface HastText {
  type: "text";
  value: string;
}
interface HastElement {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}
type HastNode = HastText | HastElement | { type: string };
interface HastRoot {
  children: HastNode[];
}

function isElement(node: HastNode): node is HastElement {
  return node.type === "element";
}

function textOf(node: HastNode): string {
  if (node.type === "text") return (node as HastText).value;
  if (isElement(node)) return node.children.map(textOf).join("");
  return "";
}

/**
 * 맨 X 게시물 링크만 있는 최상위 문단에 `data-x-post-url` 표시를 단다.
 *
 * 루트의 직계 자식만 훑는다. `components.p` 로 넘어오는 hast 노드에는 부모 정보가
 * 없어서, 인용문·목록 안의 문단과 최상위 문단을 거기서는 구분할 수 없기 때문이다.
 * 실제로 카드를 그리는 일은 PostContent 의 `components.p` 가 맡는다.
 */
export default function rehypeXPostEmbed() {
  return (tree: HastRoot): void => {
    for (const node of tree.children) {
      if (!isElement(node) || node.tagName !== "p") continue;

      // 줄 사이 공백 텍스트는 무시하고, 남은 자식이 링크 하나뿐일 때만 본다.
      const parts = node.children.filter(
        (c) => !(c.type === "text" && (c as HastText).value.trim() === ""),
      );
      if (parts.length !== 1) continue;
      const [only] = parts;
      if (!isElement(only) || only.tagName !== "a") continue;

      const href = only.properties.href;
      if (typeof href !== "string") continue;
      if (!matchBareXPostLink(href, textOf(only))) continue;

      node.properties.dataXPostUrl = href;
    }
  };
}
