import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import PatchContentInner from "@/components/patchnotes/PatchContentInner";
import PatchList from "@/components/patchnotes/PatchList";
import { getPatchVersions } from "@/lib/api/patchnotes";
import { fetchPatchNoteServer } from "@/lib/server/patchnotes";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ versionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionId } = await params;
  const title = `리그오브레전드 패치노트 ${versionId}`;
  return {
    title,
    description: `리그 오브 레전드 패치 ${versionId} 변경사항 - 챔피언, 아이템, 시스템 변경사항을 한눈에 확인하세요`,
    openGraph: {
      title,
      description: `리그 오브 레전드 패치 ${versionId} 변경사항 - 챔피언, 아이템, 시스템 변경사항을 한눈에 확인하세요`,
    },
  };
}

export default async function PatchNotePage({ params }: Props) {
  const { versionId } = await params;
  const [patchNote, patches] = await Promise.all([
    fetchPatchNoteServer(versionId),
    getPatchVersions(),
  ]);

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
                  selectedVersion={versionId}
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
