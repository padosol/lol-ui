"use client";

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

interface Match {
  id: string;
  champion: string;
  championIcon: string;
  result: "WIN" | "LOSS";
  gameMode: string;
  position: string;
  kda: {
    kills: number;
    deaths: number;
    assists: number;
  };
  gameDuration: number;
  gameDate: string;
  items: number[];
}

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

  // 전적 요약 원차트 데이터
  const winLossChartData = {
    labels: ["승리", "패배"],
    datasets: [
      {
        data: [wins, losses],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderColor: ["#16a34a", "#dc2626"],
        borderWidth: 2,
      },
    ],
  };

  const winLossChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // 포지션별 통계
  const positionStats = matches.reduce((acc, match) => {
    acc[match.position] = (acc[match.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const positions = Object.entries(positionStats)
    .sort((a, b) => b[1] - a[1])
    .map(([position, count]) => ({ position, count }));

  // 포지션 이름을 앞 글자로 축약
  const getPositionAbbreviation = (position: string): string => {
    if (!position || position === "UNKNOWN") return "?";
    return position.charAt(0).toUpperCase();
  };

  // 포지션 막대차트 데이터
  const positionChartData = {
    labels: positions.map((pos) => getPositionAbbreviation(pos.position)),
    datasets: [
      {
        label: "게임 수",
        data: positions.map((pos) => pos.count),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
    ],
  };

  const positionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
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
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#9ca3af",
        },
        grid: {
          color: "#374151",
        },
      },
      x: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-lg p-3 mb-4 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 전적 요약 - 원차트 */}
        <div className="space-y-1.5">
          <div className="text-gray-400 text-xs mb-1">전적 요약</div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              <Doughnut data={winLossChartData} options={winLossChartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-white font-bold text-sm">{winRate}%</div>
                <div className="text-gray-400 text-[10px]">승률</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
                <span className="text-gray-300">
                  승리{" "}
                  <span className="text-green-400 font-semibold">{wins}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded"></div>
                <span className="text-gray-300">
                  패배{" "}
                  <span className="text-red-400 font-semibold">{losses}</span>
                </span>
              </div>
            </div>
            <div className="text-gray-400 text-[10px]">
              총 {matches.length}게임
            </div>
          </div>
        </div>

        {/* 주요 챔피언 - Row 형태 */}
        <div className="space-y-1.5">
          <div className="text-gray-400 text-xs mb-1">주요 챔피언</div>
          <div className="space-y-1.5">
            {topChampions.map((champ, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-1.5 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
                  {champ.icon && champ.icon.startsWith("http") ? (
                    <Image
                      src={champ.icon}
                      alt={champ.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-base">{champ.icon || "🎮"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">
                    {champ.name}
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    {champ.games}게임 · 승률 {champ.winRate}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-xs font-semibold">
                    {champ.wins}승 {champ.games - champ.wins}패
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 포지션 - 막대차트 */}
        <div className="space-y-1.5">
          <div className="text-gray-400 text-xs mb-1">포지션</div>
          <div className="h-32">
            <Bar data={positionChartData} options={positionChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
