"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * 열려 있는 모달 스택.
 *
 * 모달은 겹칠 수 있다 (예: 상세 모달 안에서 삭제 확인 모달). 스택이 없으면
 * (1) Escape 한 번에 모달이 전부 닫히고
 * (2) 안쪽 모달을 닫는 순간 body 스크롤 잠금이 풀려 바깥 모달 뒤 페이지가 스크롤된다.
 * 최상단 id 만 Escape 를 처리하고, 스택이 완전히 빌 때만 스크롤을 되돌린다.
 */
const openStack: string[] = [];
let previousBodyOverflow = "";

function pushModal(id: string) {
  if (openStack.length === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openStack.push(id);
}

function popModal(id: string) {
  const index = openStack.lastIndexOf(id);
  if (index !== -1) openStack.splice(index, 1);
  if (openStack.length === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

const noopSubscribe = () => () => {};

/**
 * 클라이언트에서 마운트가 끝났는지. `createPortal` 의 대상인 document 가
 * 서버에는 없어서 필요하다.
 *
 * effect + setState 대신 useSyncExternalStore 를 쓰는 이유:
 * 하이드레이션 중에는 getServerSnapshot(false)이 쓰여 서버 결과와 일치하고,
 * 하이드레이션 이후에 getSnapshot(true)으로 넘어간다. 불일치도, 추가 렌더 경고도 없다.
 */
function useHasMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** 헤더 우측 X 버튼 노출 여부 */
  showCloseButton?: boolean;
  /** 배경 클릭으로 닫기. 처리 중에는 false 로 내려 닫기를 막는다. */
  closeOnBackdrop?: boolean;
  /** Escape 로 닫기. 처리 중에는 false 로 내려 닫기를 막는다. */
  closeOnEscape?: boolean;
  size?: ModalSize;
  /** 푸터 영역 (주로 액션 버튼) */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * 공용 모달 셸. 오버레이·스크롤 잠금·Escape·포커스 관리만 담당하고
 * 내용은 children 이 채운다.
 */
export function Modal({
  open,
  onClose,
  title,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = "md",
  footer,
  children,
}: ModalProps) {
  const instanceId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useHasMounted();

  useEffect(() => {
    if (!open) return;
    pushModal(instanceId);
    return () => popModal(instanceId);
  }, [open, instanceId]);

  // 열릴 때 포커스를 모달 안으로 옮기고, 닫힐 때 원래 위치로 되돌린다.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? panel)?.focus();
    return () => restoreFocusRef.current?.focus?.();
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!closeOnEscape) return;
        // 겹쳐 있을 때 최상단 모달만 반응한다.
        if (openStack[openStack.length - 1] !== instanceId) return;
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [closeOnEscape, instanceId, onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open || !mounted) return null;

  const labelId = title ? `${instanceId}-title` : undefined;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onMouseDown={(e) => {
        // click 이 아니라 mousedown 기준. 모달 안에서 드래그를 시작해 배경에서 놓으면
        // click 의 target 이 배경이 되어 의도치 않게 닫힌다.
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={`bg-surface-4 rounded-lg border border-divider w-full ${SIZE_CLASS[size]} mx-4 max-h-[90vh] overflow-y-auto p-6 outline-none`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-6">
            {title ? (
              <h2 id={labelId} className="text-lg font-bold text-on-surface">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="text-on-surface-disabled hover:text-on-surface transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {children}

        {footer && <div className="flex gap-3 mt-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
