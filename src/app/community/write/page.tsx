import type { Metadata } from "next";
import { CommunityWritePageClient } from "@/views/community";

export const metadata: Metadata = {
  title: "글쓰기 | 커뮤니티 | METAPICK.ME",
  description: "리그 오브 레전드 커뮤니티에 게시글을 작성하세요.",
};

export default function CommunityWritePage() {
  return <CommunityWritePageClient />;
}
