import { CommunityDetailPageClient } from "@/views/community";

interface CommunityDetailPageProps {
  params: Promise<{ postId: string }>;
}

export default async function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const { postId } = await params;
  return <CommunityDetailPageClient postId={Number(postId)} />;
}
