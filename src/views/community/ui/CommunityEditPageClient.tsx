"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header, Navigation, Footer } from "@/widgets/layout";
import { usePostDetail, useUpdatePost } from "@/entities/community";
import { PostEditorForm } from "@/features/community-post-editor";
import type { PostEditorFormData } from "@/features/community-post-editor/model/postEditorSchema";

interface CommunityEditPageClientProps {
  postId: number;
}

export default function CommunityEditPageClient({ postId }: CommunityEditPageClientProps) {
  const router = useRouter();
  const { data: post, isLoading } = usePostDetail(postId);
  const updateMutation = useUpdatePost();

  const handleSubmit = (data: PostEditorFormData) => {
    updateMutation.mutate(
      { postId, data },
      {
        onSuccess: () => {
          router.push(`/community/${postId}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-on-surface-disabled">로딩 중...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-on-surface-disabled">게시글을 찾을 수 없습니다.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="max-w-[1024px] px-4 sm:px-0 space-y-4">
          <button
            type="button"
            onClick={() => router.push(`/community/${postId}`)}
            className="flex items-center gap-1 text-sm text-on-surface-medium hover:text-on-surface transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>

          <div className="bg-surface-1 border border-divider rounded-lg p-6">
            <h1 className="text-lg font-bold text-on-surface mb-6">글 수정</h1>
            <PostEditorForm
              defaultValues={{
                title: post.title,
                content: post.content,
                category: post.category,
              }}
              onSubmit={handleSubmit}
              isPending={updateMutation.isPending}
              submitLabel="수정"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
