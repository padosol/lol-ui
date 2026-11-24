"use client";

import { useTranslations } from "next-intl";
import type { PersonStatus } from "../types";

/** 색만으로 구분하지 않는다 — 늘 상태 이름을 함께 쓴다. */
const TONE: Record<PersonStatus, string> = {
  CONTRACTED: "bg-success/15 text-success",
  ON_LOAN: "bg-secondary/15 text-secondary",
  FREE_AGENT: "bg-warning/15 text-warning",
  RETIRED: "bg-surface-8 text-on-surface-medium",
};

export default function PersonStatusBadge({ status }: { status: PersonStatus }) {
  const t = useTranslations("domain.esports.personStatus");
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${TONE[status]}`}>
      {t(status)}
    </span>
  );
}
