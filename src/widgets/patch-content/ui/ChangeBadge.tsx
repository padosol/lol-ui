"use client";

import type { ChangeType } from "@/entities/patch-note";
import { useTranslations } from "next-intl";

interface ChangeBadgeProps {
  type: ChangeType;
  size?: "sm" | "md";
}

/** 라벨은 messages 의 patchNotes.changeType.<messageKey> 에서 가져온다. */
const badgeConfig = {
  buff: {
    messageKey: "BUFF",
    className: "bg-win/20 text-win",
  },
  nerf: {
    messageKey: "NERF",
    className: "bg-loss/20 text-loss",
  },
  adjust: {
    messageKey: "ADJUST",
    className: "bg-primary/20 text-primary",
  },
  new: {
    messageKey: "NEW",
    className: "bg-secondary/20 text-secondary",
  },
  rework: {
    messageKey: "REWORK",
    className: "bg-warning/20 text-warning",
  },
  bugfix: {
    messageKey: "BUGFIX",
    className: "bg-on-surface-medium/20 text-on-surface-medium",
  },
} as const satisfies Record<
  ChangeType,
  { messageKey: string; className: string }
>;

export default function ChangeBadge({ type, size = "sm" }: ChangeBadgeProps) {
  const t = useTranslations("patchNotes.changeType");
  const config = badgeConfig[type];

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.className} ${sizeClasses}`}
    >
      {t(config.messageKey)}
    </span>
  );
}
