"use client";

import type { PatchSummary } from "@/types/patchnotes";
import { BarChart3 } from "lucide-react";

interface PatchSummaryCardProps {
  summary: PatchSummary;
}

interface SummaryRowProps {
  label: string;
  buffs: number;
  nerfs: number;
  adjusts: number;
}

function SummaryRow({ label, buffs, nerfs, adjusts }: SummaryRowProps) {
  const total = buffs + nerfs + adjusts;

  return (
    <tr className="border-t border-divider/30">
      <td className="py-2.5 px-3 text-on-surface font-medium">{label}</td>
      <td className="py-2.5 px-3 text-center">
        {buffs > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-win/20 text-win text-sm font-medium">
            {buffs}
          </span>
        ) : (
          <span className="text-on-surface-medium text-sm">-</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-center">
        {nerfs > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-loss/20 text-loss text-sm font-medium">
            {nerfs}
          </span>
        ) : (
          <span className="text-on-surface-medium text-sm">-</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-center">
        {adjusts > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-medium">
            {adjusts}
          </span>
        ) : (
          <span className="text-on-surface-medium text-sm">-</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-on-surface font-semibold">{total}</span>
      </td>
    </tr>
  );
}

export default function PatchSummaryCard({ summary }: PatchSummaryCardProps) {
  const championTotal = summary.championBuffs + summary.championNerfs + summary.championAdjusts;
  const itemTotal = summary.itemBuffs + summary.itemNerfs + summary.itemAdjusts;
  const arenaTotal = summary.arenaBuffs + summary.arenaNerfs + summary.arenaAdjusts;

  const hasChampions = championTotal > 0;
  const hasItems = itemTotal > 0;
  const hasArena = arenaTotal > 0;

  if (!hasChampions && !hasItems && !hasArena) {
    return null;
  }

  return (
    <div className="bg-surface-1 rounded-lg border border-divider/50 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-divider/30">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-on-surface">패치 요약</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2/50">
              <th className="py-2.5 px-3 text-left text-sm font-semibold text-on-surface-medium">
                카테고리
              </th>
              <th className="py-2.5 px-3 text-center text-sm font-semibold text-win">
                상향
              </th>
              <th className="py-2.5 px-3 text-center text-sm font-semibold text-loss">
                하향
              </th>
              <th className="py-2.5 px-3 text-center text-sm font-semibold text-primary">
                조정
              </th>
              <th className="py-2.5 px-3 text-center text-sm font-semibold text-on-surface-medium">
                합계
              </th>
            </tr>
          </thead>
          <tbody>
            {hasChampions && (
              <SummaryRow
                label="챔피언"
                buffs={summary.championBuffs}
                nerfs={summary.championNerfs}
                adjusts={summary.championAdjusts}
              />
            )}
            {hasItems && (
              <SummaryRow
                label="아이템"
                buffs={summary.itemBuffs}
                nerfs={summary.itemNerfs}
                adjusts={summary.itemAdjusts}
              />
            )}
            {hasArena && (
              <SummaryRow
                label="아레나"
                buffs={summary.arenaBuffs}
                nerfs={summary.arenaNerfs}
                adjusts={summary.arenaAdjusts}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
