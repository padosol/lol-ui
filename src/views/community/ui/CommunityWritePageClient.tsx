"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header, Navigation, Footer } from "@/widgets/layout";
import { useCreatePost } from "@/entities/community";
import { PostEditorForm } from "@/features/community-post-editor";
import type { PostEditorFormData } from "@/features/community-post-editor/model/postEditorSchema";

export default function CommunityWritePageClient() {
  const router = useRouter();
  const createMutation = useCreatePost();

  const handleSubmit = (data: PostEditorFormData) => {
    createMutation.mutate(data, {
      onSuccess: (post) => {
        router.push(`/community/${post.id}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[1080px] mx-auto py-8 sm:px-4">
        <div className="max-w-[1024px] px-4 sm:px-0 space-y-4">
          <button
            type="button"
            onClick={() => router.push("/community")}
            className="flex items-center gap-1 text-sm text-on-surface-medium hover:text-on-surface transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </button>

          <div className="bg-surface-1 border border-divider rounded-lg p-6">
            <h1 className="text-lg font-bold text-on-surface mb-6">글쓰기</h1>
            <PostEditorForm
              onSubmit={handleSubmit}
              isPending={createMutation.isPending}
              submitLabel="등록"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
