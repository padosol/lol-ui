import type { Metadata } from "next";
import { CommunityPageClient } from "@/views/community";

export const metadata: Metadata = {
  title: "커뮤니티 | METAPICK.ME",
  description: "리그 오브 레전드 커뮤니티. 챔피언 토론, 패치노트 의견, 팁과 가이드를 공유하세요.",
};

export default function CommunityPage() {
  return <CommunityPageClient />;
}
