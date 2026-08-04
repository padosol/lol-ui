import type { Metadata } from "next";
import { CommunityEditPageClient } from "@/views/community";

export const metadata: Metadata = {
  title: "글 수정 | 커뮤니티 | METAPICK.ME",
  description: "게시글을 수정합니다.",
};

interface CommunityEditPageProps {
  params: Promise<{ postId: string }>;
}

export default async function CommunityEditPage({ params }: CommunityEditPageProps) {
  const { postId } = await params;
  return <CommunityEditPageClient postId={Number(postId)} />;
}
