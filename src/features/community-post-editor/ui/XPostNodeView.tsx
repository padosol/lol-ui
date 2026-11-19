"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { XPostEmbed } from "@/shared/ui/x-post-embed";

/**
 * 에디터 안의 X 게시물 카드.
 *
 * <p>카드는 X 의 iframe 이라 그 위 클릭은 ProseMirror 에 닿지 않는다 — 노드를 선택해
 * Backspace 로 지울 수도, 끌어 옮길 수도 없게 된다. 투명 덮개가 iframe 을 가려 클릭을
 * 대신 받고, 그래서 노드가 선택된다. 편집 중에는 카드 안을 조작할 일이 없다.
 */
export function XPostNodeView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper className="x-post-node" data-drag-handle>
      <XPostEmbed url={node.attrs.url as string} />
      <div className="x-post-node__shield" aria-hidden />
    </NodeViewWrapper>
  );
}
