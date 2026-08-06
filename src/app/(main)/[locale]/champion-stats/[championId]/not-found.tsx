"use client";

import { Header, Navigation, Footer } from "@/widgets/layout";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function ChampionNotFoundPage() {
  const t = useTranslations("meta");
  const params = useParams();
  const championId = (params?.championId as string) ?? "";

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-5xl mx-auto py-8">
        <div className="text-center py-20">
          <p className="text-lg text-on-surface-medium">
            {t("championNotFound")}{" "}
            <span className="font-medium text-on-surface">{championId}</span>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
