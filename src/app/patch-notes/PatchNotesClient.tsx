"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import PatchContent from "@/components/patchnotes/PatchContent";
import PatchList from "@/components/patchnotes/PatchList";
import { usePatchVersions } from "@/hooks/usePatchNotes";
import { useMemo, useState } from "react";

export default function PatchNotesClient() {
  const [userSelectedVersion, setUserSelectedVersion] = useState<string | null>(null);
  const { data: patches } = usePatchVersions();

  // 사용자가 선택한 버전이 있으면 그것을, 없으면 첫 번째 패치를 사용
  const selectedVersion = useMemo(() => {
    if (userSelectedVersion) return userSelectedVersion;
    if (patches && patches.length > 0) return patches[0].versionId;
    return null;
  }, [userSelectedVersion, patches]);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-on-surface mb-2">패치노트</h1>
          <p className="text-on-surface-medium">
            리그 오브 레전드 패치 변경사항을 확인하세요
          </p>
        </div>

        {/* 메인 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 좌측: 패치 리스트 (1/4) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <PatchList
                  selectedVersion={selectedVersion}
                  onSelectVersion={setUserSelectedVersion}
                />
              </div>
            </div>
          </aside>

          {/* 우측: 패치 내용 (3/4) */}
          <section className="lg:col-span-3">
            <PatchContent version={selectedVersion} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
