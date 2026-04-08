"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

interface GoldFlowEntry {
  teamId: number;
  timestamp: number;
  total_gold: number;
}

// 더미 데이터: 1분 간격, 30분 게임
const DUMMY_DATA: GoldFlowEntry[] = (() => {
  const entries: GoldFlowEntry[] = [];
  let blueGold = 500;
  let redGold = 500;

  for (let t = 0; t <= 30; t++) {
    blueGold += Math.floor(Math.random() * 800 + 400);
    redGold += Math.floor(Math.random() * 800 + 400);
    entries.push({ teamId: 100, timestamp: t, total_gold: blueGold });
    entries.push({ teamId: 200, timestamp: t, total_gold: redGold });
  }
  return entries;
})();

export default function GoldFlowChart() {
  const blueData = DUMMY_DATA.filter((d) => d.teamId === 100);
  const redData = DUMMY_DATA.filter((d) => d.teamId === 200);

  const labels = blueData.map((d) => `${d.timestamp}m`);
  const goldDiffs = blueData.map(
    (b, i) => b.total_gold - redData[i].total_gold
  );

  const maxAbsDiff = Math.max(...goldDiffs.map(Math.abs), 1000);
  const yBound = Math.ceil(maxAbsDiff / 1000) * 1000;

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        data: goldDiffs,
        fill: {
          target: "origin",
          above: "rgba(66, 133, 244, 0.15)",
          below: "rgba(234, 67, 53, 0.15)",
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderWidth: 2,
        tension: 0.3,
        segment: {
          borderColor: (ctx) => {
            const y0 = ctx.p0.parsed.y ?? 0;
            const y1 = ctx.p1.parsed.y ?? 0;
            return (y0 + y1) / 2 >= 0
              ? "rgba(66, 133, 244, 0.9)"
              : "rgba(234, 67, 53, 0.9)";
          },
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        padding: 8,
        callbacks: {
          label: (ctx) => {
            const diff = ctx.parsed.y ?? 0;
            const absDiff = Math.abs(diff).toLocaleString();
            if (diff > 0) return `블루팀 +${absDiff}g`;
            if (diff < 0) return `레드팀 +${absDiff}g`;
            return "동일";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "rgba(255,255,255,0.4)",
          font: { size: 10 },
          maxTicksLimit: 10,
        },
        border: { display: false },
      },
      y: {
        min: -yBound,
        max: yBound,
        grid: {
          color: (ctx) =>
            ctx.tick.value === 0
              ? "rgba(255,255,255,0.2)"
              : "rgba(255,255,255,0.06)",
        },
        ticks: {
          color: "rgba(255,255,255,0.4)",
          font: { size: 10 },
          callback: (value) => {
            const v = Number(value);
            if (v === 0) return "0";
            return `${v > 0 ? "+" : ""}${(v / 1000).toFixed(0)}k`;
          },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-surface-4/30 rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-on-surface text-xs font-semibold">골드 흐름</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-team-blue inline-block" />
            <span className="text-on-surface-medium">블루팀 우세</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-loss inline-block" />
            <span className="text-on-surface-medium">레드팀 우세</span>
          </span>
        </div>
      </div>
      <div className="h-40">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
