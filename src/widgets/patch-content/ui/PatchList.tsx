import type { PatchVersionListItem } from "@/entities/patch-note";
import { useTranslations } from "next-intl";
import PatchListItem from "./PatchListItem";

interface PatchListProps {
  patches: PatchVersionListItem[];
  selectedVersion: string;
}

export default function PatchList({
  patches,
  selectedVersion,
}: PatchListProps) {
  const t = useTranslations("patchNotes");

  if (patches.length === 0) {
    return (
      <div className="p-4 bg-surface-2 rounded-lg border border-divider/50">
        <p className="text-on-surface-medium text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {patches.map((patch) => (
        <PatchListItem
          key={patch.versionId}
          patch={patch}
          isSelected={selectedVersion === patch.versionId}
        />
      ))}
    </div>
  );
}
