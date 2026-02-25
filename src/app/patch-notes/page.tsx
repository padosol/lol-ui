import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import PatchContentInner from "@/components/patchnotes/PatchContentInner";
import PatchList from "@/components/patchnotes/PatchList";
import { getPatchVersions } from "@/lib/api/patchnotes";
import { fetchPatchNoteServer } from "@/lib/server/patchnotes";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const patches = await getPatchVersions();
  const versionId = patches.length > 0 ? patches[0].versionId : "";
  const title = versionId
    ? `리그오브레전드 패치노트 ${versionId}`
    : "리그오브레전드 패치노트";
  const description = versionId
    ? `리그 오브 레전드 패치 ${versionId} 변경사항 - 챔피언, 아이템, 시스템 변경사항을 한눈에 확인하세요`
    : "리그 오브 레전드 패치 변경사항을 확인하세요";
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function PatchNotesPage() {
  const patches = await getPatchVersions();

  if (patches.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-medium">패치노트가 없습니다.</p>
      </div>
    );
  }

  const latestVersionId = patches[0].versionId;
  const patchNote = await fetchPatchNoteServer(latestVersionId);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-on-surface mb-2">패치노트</h1>
          <p className="text-on-surface-medium">
            리그 오브 레전드 패치 변경사항을 확인하세요
          </p>
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
      </main>
      <Footer />
    </div>
  );
}
