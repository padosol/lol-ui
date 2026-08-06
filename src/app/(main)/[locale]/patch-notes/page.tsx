import { Header, Navigation, Footer } from "@/widgets/layout";
import { PatchContentInner, PatchList } from "@/widgets/patch-content";
import { getPatchVersions } from "@/entities/patch-note";
import { fetchPatchNoteServer } from "@/entities/patch-note/lib/serverPatchnotes";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/shared/i18n/alternates";
import { toLocale } from "@/shared/i18n/locale";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale: toLocale(locale), namespace: "meta.patchNotes" });
  const patches = await getPatchVersions();
  const versionId = patches.length > 0 ? patches[0].versionId : "";
  const title = versionId
    ? tMeta("titleWithVersion", { version: versionId })
    : tMeta("title");
  const description = versionId
    ? tMeta("descriptionWithVersion", { version: versionId })
    : tMeta("description");
  return {
    title,
    description,
    alternates: localeAlternates(locale, "/patch-notes"),
    openGraph: { title, description },
  };
}

export default async function PatchNotesPage() {
  const t = await getTranslations("patchNotes");
  const patches = await getPatchVersions();

  if (patches.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-medium">{t("empty")}</p>
      </div>
    );
  }

  const latestVersionId = patches[0].versionId;
  const patchNote = await fetchPatchNoteServer(latestVersionId);

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
                    selectedVersion={latestVersionId}
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
