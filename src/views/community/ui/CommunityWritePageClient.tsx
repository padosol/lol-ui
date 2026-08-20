"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";
import { Header, Navigation, Footer } from "@/widgets/layout";
import { useCreatePost, postHref } from "@/entities/community";
import { PostEditorForm } from "@/features/community-post-editor";
import type { PostEditorSubmitData } from "@/features/community-post-editor/model/postEditorSchema";

export default function CommunityWritePageClient() {
  const t = useTranslations("community");
  const router = useRouter();
  const createMutation = useCreatePost();

  const handleSubmit = (data: PostEditorSubmitData) => {
    createMutation.mutate(data, {
      onSuccess: (post) => {
        router.push(postHref(post.id));
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <Navigation />
      <main className="flex-1 w-full max-w-[920px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <h1 className="text-xl font-bold tracking-tight text-on-surface">
            {t("write")}
          </h1>
          <span className="text-[13px] font-semibold text-on-surface-disabled">
            {t("title")}
          </span>
        </div>

        <PostEditorForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/community")}
          isPending={createMutation.isPending}
          submitLabel={t("submit")}
        />
      </main>
      <Footer />
    </div>
  );
}
