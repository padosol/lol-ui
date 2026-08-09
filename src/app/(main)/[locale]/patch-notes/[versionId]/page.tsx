import { Header, Navigation, Footer } from "@/widgets/layout";
import { PatchContentInner, PatchList } from "@/widgets/patch-content";
import { getPatchVersions } from "@/entities/patch-note";
import { fetchPatchNoteServer } from "@/entities/patch-note/lib/serverPatchnotes";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; versionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, versionId } = await params;
  const tMeta = await getTranslations({ locale: toLocale(locale), namespace: "meta.patchNotes" });
  const title = tMeta("titleWithVersion", { version: versionId });
  const description = tMeta("descriptionWithVersion", { version: versionId });
  return {
    title,
    description,
    alternates: localeAlternates(locale, `/patch-notes/${versionId}`),
    openGraph: { title, description },
  };
}

export default async function PatchNotePage({ params }: Props) {
  const t = await getTranslations("patchNotes");
  const { versionId } = await params;
  const [patchNote, patches] = await Promise.all([
    fetchPatchNoteServer(versionId),
    getPatchVersions(),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-[1080px] mx-auto py-8">
        <div className="max-w-[1024px]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-on-surface mb-2">
              {t("title")}
            </h1>
            <p className="text-on-surface-medium">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  <PatchList
                    patches={patches}
                    selectedVersion={versionId}
                  />
                </div>
              </div>
            </aside>

            <section className="lg:col-span-3">
              <PatchContentInner patchNote={patchNote} />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
