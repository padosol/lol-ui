import type { Metadata } from "next";
import PatchNotesClient from "./PatchNotesClient";

export const metadata: Metadata = {
  title: "패치노트 | METAPICK",
  description: "리그 오브 레전드 패치노트 요약 - 챔피언, 아이템, 시스템 변경사항을 한눈에 확인하세요",
  openGraph: {
    title: "패치노트 | METAPICK",
    description: "리그 오브 레전드 패치노트 요약 - 챔피언, 아이템, 시스템 변경사항을 한눈에 확인하세요",
  },
};

export default function PatchNotesPage() {
  return <PatchNotesClient />;
}
