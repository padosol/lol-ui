"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Modal, type ModalSize } from "./Modal";

export interface ConfirmModalProps {
  open: boolean;
  /** 모달 제목 */
  title: string;
  /** 본문. 문자열 대신 노드도 받는다. */
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger 는 파괴적 동작(삭제·탈퇴)용 */
  variant?: "default" | "danger";
  /** 처리 중. true 면 버튼이 잠기고 배경/Escape 로 닫히지 않는다. */
  loading?: boolean;
  size?: ModalSize;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * 브라우저 기본 `confirm()` 을 대체하는 확인 모달.
 *
 * `confirm()` 은 메인 스레드를 막고 스타일을 입힐 수 없으며 모바일에서 도메인이 노출된다.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  loading = false,
  size = "sm",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const t = useTranslations("common");
  const isDanger = variant === "danger";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={false}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-surface-4 border border-divider text-on-surface-medium rounded-lg text-sm font-medium hover:bg-surface-1 transition-colors disabled:opacity-50"
          >
            {cancelLabel ?? t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              isDanger
                ? "bg-error hover:bg-error/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {loading ? t("processing") : (confirmLabel ?? t("confirm"))}
          </button>
        </>
      }
    >
      {description &&
        (isDanger ? (
          <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div className="text-sm text-on-surface-medium leading-relaxed">
              {description}
            </div>
          </div>
        ) : (
          <div className="text-sm text-on-surface-medium leading-relaxed">
            {description}
          </div>
        ))}
    </Modal>
  );
}
