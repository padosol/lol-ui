"use client";

import type { Match } from "@/types/api";
import ContributionGraph from "./ContributionGraph";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import Image from "next/image";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MatchSummaryProps {
  matches: Match[];
}

export default function MatchSummary({ matches }: MatchSummaryProps) {
  if (matches.length === 0) {
    return null;
  }

  // 매치 요약 통계 계산
  const wins = matches.filter((m) => m.result === "WIN").length;
  const losses = matches.length - wins;
  const winRate = ((wins / matches.length) * 100).toFixed(1);

  // 전적 요약 원차트 데이터 (Material Design 2 desaturated colors)
  const winLossChartData = {
    labels: ["승리", "패배"],
    datasets: [
      {
        data: [wins, losses],
        backgroundColor: ["#4CAF50", "#E57373"], // desaturated green/red
        borderColor: ["#388E3C", "#C62828"],
        borderWidth: 2,
      },
    ],
  };

  const winLossChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { label?: string; parsed?: number }) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = wins + losses;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}게임 (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  // 챔피언별 통계
  const championStats = matches.reduce((acc, match) => {
    if (!acc[match.champion]) {
      acc[match.champion] = {
        name: match.champion,
        icon: match.championIcon,
        games: 0,
        wins: 0,
      };
    }
    acc[match.champion].games++;
    if (match.result === "WIN") {
      acc[match.champion].wins++;
    }
    return acc;
  }, {} as Record<string, { name: string; icon: string; games: number; wins: number }>);

  const topChampions = Object.values(championStats)
    .sort((a, b) => b.games - a.games)
    .slice(0, 3)
    .map((champ) => ({
      ...champ,
      winRate: ((champ.wins / champ.games) * 100).toFixed(1),
    }));

  // 모든 포지션 정의
  const allPositions = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

  // 포지션별 통계 (Invalid 제외)
  const positionStats = matches.reduce((acc, match) => {
    if (
      match.position &&
      match.position.toUpperCase() !== "INVALID" &&
      match.position.toUpperCase() !== "UNKNOWN"
    ) {
      const position = match.position.toUpperCase();
      // ADC를 BOTTOM으로 통일
      const normalizedPosition = position === "ADC" ? "BOTTOM" : position;
      acc[normalizedPosition] = (acc[normalizedPosition] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 모든 포지션을 포함하되, 플레이하지 않은 포지션은 0으로 설정
  const positions = allPositions.map((position) => ({
    position,
    count: positionStats[position] || 0,
  }));

  // 포지션 막대차트 데이터 (Material Design primary color)
  const positionChartData = {
    labels: positions.map(() => ""), // 축약 문구 제거
    datasets: [
      {
        label: "게임 수",
        data: positions.map((pos) => pos.count),
        backgroundColor: "#BB86FC", // Material Design 2 primary
        borderColor: "#9965F4",
        borderWidth: 1,
      },
    ],
  };

  const positionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    onHover: (_event: any, _elements: any, chart: any) => {
      chart.canvas.style.cursor = "default";
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        animation: {
          duration: 100,
        },
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            const value = context.parsed.y;
            const index = context.dataIndex;
            const fullPosition = positions[index]?.position || "";
            return value !== null ? `${fullPosition}: ${value}게임` : "0게임";
          },
        },
      },
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
      },
      x: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-surface-1 rounded-lg p-2 mb-3 border border-divider">
      <div className="grid grid-cols-1 md:grid-cols-[2.5fr_4fr_2.5fr_4.5fr] gap-2">
        {/* 전적 요약 - 원차트 */}
        <div className="flex flex-col min-w-0">
          <div className="text-on-surface-medium text-xs mb-0.5">전적 요약</div>
          <div className="flex flex-col items-center gap-1.5 mt-auto">
            <div className="relative w-20 h-20">
              <Doughnut data={winLossChartData} options={winLossChartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-on-surface font-bold text-xs">{winRate}%</div>
                <div className="text-on-surface-medium text-[9px]">승률</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[11px]">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-win rounded"></div>
                <span className="text-on-surface-medium">
                  승리{" "}
                  <span className="text-win font-semibold">{wins}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-loss rounded"></div>
                <span className="text-on-surface-medium">
                  패배{" "}
                  <span className="text-loss font-semibold">{losses}</span>
                </span>
              </div>
            </div>
            <div className="text-on-surface-medium text-[9px]">
              총 {matches.length}게임
            </div>
          </div>
        </div>

        {/* 주요 챔피언 - Row 형태 */}
        <div className="flex flex-col min-w-0">
          <div className="text-on-surface-medium text-xs mb-0.5">주요 챔피언</div>
          <div className="space-y-1 mt-auto">
            {topChampions.map((champ, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 p-1 bg-surface-4 rounded-lg hover:bg-surface-6 transition-colors"
              >
                <div className="w-7 h-7 bg-surface-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
                  {champ.icon && champ.icon.startsWith("http") ? (
                    <Image
                      src={champ.icon}
                      alt={champ.name}
                      fill
                      sizes="28px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm">{champ.icon || "🎮"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-on-surface text-[11px] font-medium truncate">
                    {champ.name}
                  </div>
                  <div className="text-on-surface-medium text-[9px]">
                    {champ.games}게임 · 승률 {champ.winRate}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-on-surface text-[11px] font-semibold">
                    {champ.wins}승 {champ.games - champ.wins}패
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 포지션 - 막대차트 */}
        <div className="flex flex-col min-w-0">
          <div className="text-on-surface-medium text-xs mb-0.5">포지션</div>
          <div className="relative mt-auto">
            <div className="h-24">
              <Bar data={positionChartData} options={positionChartOptions} />
            </div>
            <div className="flex items-center justify-around mt-1">
              {positions.map((pos, index) => {
                const positionUpper = pos.position?.toUpperCase() || "";
                const positionImageUrl = `https://static.mmrtr.shop/position/Position-${positionUpper}.png`;
                return (
                  <div key={index} className="relative w-5 h-5 shrink-0">
                    <Image
                      src={positionImageUrl}
                      alt={pos.position}
                      fill
                      sizes="20px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 게임 활동 - 잔디 그래프 */}
        <div className="space-y-1 min-w-0">
          <div className="text-on-surface-medium text-xs mb-0.5">게임 활동</div>
          <ContributionGraph matches={matches} />
        </div>
      </div>
    </div>
  );
}
