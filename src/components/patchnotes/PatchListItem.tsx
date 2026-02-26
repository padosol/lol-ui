import type { PatchVersionListItem } from "@/types/patchnotes";
import Link from "next/link";

interface PatchListItemProps {
  patch: PatchVersionListItem;
  isSelected: boolean;
}

export default function PatchListItem({
  patch,
  isSelected,
}: PatchListItemProps) {
  return (
    <Link
      href={`/patch-notes/${patch.versionId}`}
      className={`block w-full text-left p-3 rounded-lg transition-all ${
        isSelected
          ? "bg-primary/20 border-l-4 border-primary"
          : "bg-surface-2 hover:bg-surface-4 border-l-4 border-transparent"
      }`}
    >
      <div className="flex flex-col gap-1">
        <span
          className={`font-bold text-lg ${
            isSelected ? "text-primary" : "text-on-surface"
          }`}
        >
          {patch.title}
        </span>
      </div>
    </Link>
  );
}
