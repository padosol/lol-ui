"use client";

import type { MatchDetail, ParticipantData } from "@/types/api";
import { getChampionImageUrl } from "@/utils/champion";
import Image from "next/image";
import { useState } from "react";
import ItemBuildOrder from "./ItemBuildOrder";
import RuneSetup from "./RuneSetup";
import SkillOrderGrid from "./SkillOrderGrid";

interface BuildTabProps {
  detail: MatchDetail;
  blueTeam: ParticipantData[];
  redTeam: ParticipantData[];
  puuid: string | null;
}

/* ─── 메인 BuildTab ─── */
export default function BuildTab({
  detail,
  blueTeam,
  redTeam,
  puuid,
}: BuildTabProps) {
  const allParticipants = detail.participantData || [];

  // 기본 선택: 검색된 소환사 (puuid 매칭), 없으면 첫 번째 참가자
  const defaultIdx = puuid
    ? Math.max(allParticipants.findIndex((p) => p.puuid === puuid), 0)
    : 0;
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const selected = allParticipants[selectedIdx];

  if (!selected) {
    return (
      <div className="text-on-surface-medium text-xs p-2">
        참가자 데이터 없음
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ─── 유저 정보 + 챔피언 선택 바 ─── */}
      <div className="rounded-lg border border-divider/50 p-3 flex items-center gap-3">
        {/* 왼쪽: 선택된 플레이어 정보 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded overflow-hidden relative bg-surface-8 shrink-0">
            <Image
              src={getChampionImageUrl(selected.championName || "")}
              alt={selected.championName || ""}
              fill
              sizes="32px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="text-on-surface text-xs font-semibold max-w-[120px] truncate">
              {selected.riotIdGameName || selected.summonerName}
            </div>
            <div className="text-on-surface-medium text-[10px]">
              {selected.championName} &middot; Lv.{selected.champLevel}
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-px h-8 bg-divider/50" />

        {/* 오른쪽: 챔피언 선택 바 (블루팀 | 레드팀) */}
        <div className="flex items-center gap-1 flex-wrap ml-auto">
          {/* 블루팀 */}
          <div className="flex items-center gap-0.5">
            {blueTeam.map((p) => {
              const idx = allParticipants.findIndex(
                (ap) => ap.participantId === p.participantId
              );
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={p.participantId}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-8 h-8 rounded overflow-hidden relative border-2 transition-all cursor-pointer ${isSelected
                    ? "border-team-blue scale-110 z-10"
                    : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  title={p.riotIdGameName || p.summonerName}
                >
                  <Image
                    src={getChampionImageUrl(p.championName || "")}
                    alt={p.championName || ""}
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>

          <div className="w-px h-6 bg-divider/50 mx-1" />

          {/* 레드팀 */}
          <div className="flex items-center gap-0.5">
            {redTeam.map((p) => {
              const idx = allParticipants.findIndex(
                (ap) => ap.participantId === p.participantId
              );
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={p.participantId}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-8 h-8 rounded overflow-hidden relative border-2 transition-all cursor-pointer ${isSelected
                    ? "border-loss scale-110 z-10"
                    : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  title={p.riotIdGameName || p.summonerName}
                >
                  <Image
                    src={getChampionImageUrl(p.championName || "")}
                    alt={p.championName || ""}
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 아이템 빌드 순서 ─── */}
      <div className="rounded-lg border border-divider/50 p-3">
        <div className="text-on-surface text-[11px] font-semibold mb-1.5">
          아이템 빌드 순서
        </div>
        <ItemBuildOrder itemSeq={selected.itemSeq} />
      </div>

      {/* ─── 스킬 순서 ─── */}
      <div className="rounded-lg border border-divider/50 p-3">
        <div className="text-on-surface text-[11px] font-semibold mb-1.5">
          스킬 순서
        </div>
        <SkillOrderGrid skillSeq={selected.skillSeq} championName={selected.championName} />
      </div>

      {/* ─── 룬 세팅 ─── */}
      <div className="rounded-lg border border-divider/50 p-3">
        <div className="text-on-surface text-[11px] font-semibold mb-1.5">
          룬
        </div>
        <RuneSetup style={selected.style} />
      </div>
    </div>
  );
}
