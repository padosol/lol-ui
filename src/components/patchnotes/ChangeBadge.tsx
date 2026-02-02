"use client";

import type { ChangeType } from "@/types/patchnotes";

interface ChangeBadgeProps {
  type: ChangeType;
  size?: "sm" | "md";
}

const badgeConfig: Record<
  ChangeType,
  { label: string; className: string }
> = {
  buff: {
    label: "버프",
    className: "bg-win/20 text-win",
  },
  nerf: {
    label: "너프",
    className: "bg-loss/20 text-loss",
  },
  adjust: {
    label: "조정",
    className: "bg-primary/20 text-primary",
  },
  new: {
    label: "신규",
    className: "bg-secondary/20 text-secondary",
  },
  rework: {
    label: "리워크",
    className: "bg-warning/20 text-warning",
  },
  bugfix: {
    label: "버그 수정",
    className: "bg-on-surface-medium/20 text-on-surface-medium",
  },
};

export default function ChangeBadge({ type, size = "sm" }: ChangeBadgeProps) {
  const config = badgeConfig[type];

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
