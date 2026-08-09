"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import { Header, Navigation, Footer } from "@/widgets/layout";
import { usePostDetail, useUpdatePost } from "@/entities/community";
import { PostEditorForm } from "@/features/community-post-editor";
import type { PostEditorFormData } from "@/features/community-post-editor/model/postEditorSchema";

interface CommunityEditPageClientProps {
  postId: number;
}

export default function CommunityEditPageClient({ postId }: CommunityEditPageClientProps) {
  const t = useTranslations("community");
  const tPost = useTranslations("community.post");
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
          <div className="text-on-surface-disabled">{t("loading")}</div>
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
          <div className="text-on-surface-disabled">{tPost("notFound")}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[920px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            {t("edit")}
          </h1>
          <span className="text-[13px] font-semibold text-on-surface-disabled">
            {t("title")}
          </span>
        </div>

        <PostEditorForm
          defaultValues={{
            title: post.title,
            content: post.content,
            category: post.category,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/community/${postId}`)}
          isPending={updateMutation.isPending}
          submitLabel={t("submitEdit")}
        />
      </main>
      <Footer />
    </div>
  );
}
