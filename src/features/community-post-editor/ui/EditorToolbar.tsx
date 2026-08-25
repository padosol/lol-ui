"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { useTranslations } from "next-intl";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareCode,
  Strikethrough,
  type LucideIcon,
} from "lucide-react";

/**
 * 툴바에 없는 것들 — 이유가 있어서 뺐다.
 *
 * <ul>
 *   <li><b>밑줄</b>: 마크다운에 문법이 없어 저장하는 순간 사라진다(usePostEditor 참고).</li>
 *   <li><b>표</b>: 편집 확장을 넣지 않았다. 뷰어는 옛 글의 표를 계속 렌더한다.</li>
 *   <li><b>링크</b>: 버튼을 누르면 URL 을 물어볼 창이 필요한데, 주소를 붙여넣거나 그냥
 *       입력하면 자동으로 링크가 된다(autolink·linkOnPaste). 창 하나를 아낀다.</li>
 *   <li><b>이미지</b>: 바로 아래 첨부 바가 같은 일을 한다. 버튼을 두 개 두지 않는다.</li>
 * </ul>
 */
type ToolbarKey =
  | "bold"
  | "italic"
  | "strike"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "code"
  | "codeBlock"
  | "horizontalRule";

interface ToolbarItem {
  /** community.editor.toolbar 의 번역 키를 겸한다. */
  key: ToolbarKey;
  icon: LucideIcon;
  active: boolean;
  run: () => void;
}

interface EditorToolbarProps {
  editor: Editor | null;
  /** 업로드 중에는 문서가 곧 바뀌므로 편집을 막는다. */
  disabled?: boolean;
}

function ToolbarButton({
  item,
  label,
  disabled,
}: Readonly<{ item: ToolbarItem; label: string; disabled: boolean }>) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.run}
      disabled={disabled}
      aria-label={label}
      aria-pressed={item.active}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
        item.active
          ? "bg-surface-8 text-on-surface"
          : "text-on-surface-medium hover:bg-surface-4 hover:text-on-surface"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

function Separator() {
  return <span className="mx-1 h-5 w-px bg-divider" aria-hidden />;
}

export default function EditorToolbar({
  editor,
  disabled = false,
}: Readonly<EditorToolbarProps>) {
  const t = useTranslations("community.editor.toolbar");

  // isActive 는 선택이 움직일 때마다 달라진다. useEditorState 로 필요한 값만 구독해
  // 트랜잭션마다 툴바 전체가 다시 그려지는 것을 막는다.
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive("bold"),
            italic: current.isActive("italic"),
            strike: current.isActive("strike"),
            heading1: current.isActive("heading", { level: 1 }),
            heading2: current.isActive("heading", { level: 2 }),
            heading3: current.isActive("heading", { level: 3 }),
            bulletList: current.isActive("bulletList"),
            orderedList: current.isActive("orderedList"),
            blockquote: current.isActive("blockquote"),
            code: current.isActive("code"),
            codeBlock: current.isActive("codeBlock"),
          }
        : null,
  });

  if (!editor || !active) {
    // 에디터는 클라이언트에서만 만들어진다(SSR 비활성). 자리를 잡아 둬야 붙는 순간
    // 아래 본문이 밀리지 않는다.
    return (
      <div className="h-[45px] border-b border-divider" aria-hidden />
    );
  }

  const chain = () => editor.chain().focus();

  const groups: ToolbarItem[][] = [
    [
      { key: "bold", icon: Bold, active: active.bold, run: () => chain().toggleBold().run() },
      { key: "italic", icon: Italic, active: active.italic, run: () => chain().toggleItalic().run() },
      { key: "strike", icon: Strikethrough, active: active.strike, run: () => chain().toggleStrike().run() },
    ],
    [
      { key: "heading1", icon: Heading1, active: active.heading1, run: () => chain().toggleHeading({ level: 1 }).run() },
      { key: "heading2", icon: Heading2, active: active.heading2, run: () => chain().toggleHeading({ level: 2 }).run() },
      { key: "heading3", icon: Heading3, active: active.heading3, run: () => chain().toggleHeading({ level: 3 }).run() },
    ],
    [
      { key: "bulletList", icon: List, active: active.bulletList, run: () => chain().toggleBulletList().run() },
      { key: "orderedList", icon: ListOrdered, active: active.orderedList, run: () => chain().toggleOrderedList().run() },
    ],
    [
      { key: "blockquote", icon: Quote, active: active.blockquote, run: () => chain().toggleBlockquote().run() },
      { key: "code", icon: Code, active: active.code, run: () => chain().toggleCode().run() },
      { key: "codeBlock", icon: SquareCode, active: active.codeBlock, run: () => chain().toggleCodeBlock().run() },
      { key: "horizontalRule", icon: Minus, active: false, run: () => chain().setHorizontalRule().run() },
    ],
  ];

  return (
    <div
      role="toolbar"
      aria-label={t("label")}
      className="flex flex-wrap items-center gap-0.5 border-b border-divider px-2 py-1.5"
    >
      {groups.map((group, index) => (
        <div key={group[0].key} className="flex items-center">
          {index > 0 && <Separator />}
          {group.map((item) => (
            <ToolbarButton
              key={item.key}
              item={item}
              label={t(item.key)}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
