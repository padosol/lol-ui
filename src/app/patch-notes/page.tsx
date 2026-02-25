import { getPatchVersions } from "@/lib/api/patchnotes";
import { redirect } from "next/navigation";

export default async function PatchNotesPage() {
  const patches = await getPatchVersions();

  if (patches.length > 0) {
    redirect(`/patch-notes/${patches[0].versionId}`);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-on-surface-medium">패치노트가 없습니다.</p>
    </div>
  );
}
