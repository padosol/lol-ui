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

interface GoldFlowChartProps {
  blueGoldTimeline: number[];
  redGoldTimeline: number[];
  timestamps: number[];
}

export default function GoldFlowChart({
  blueGoldTimeline,
  redGoldTimeline,
  timestamps,
}: GoldFlowChartProps) {
  const labels = timestamps.map((ts) => `${Math.floor(ts / 60000)}m`);
  const goldDiffs = blueGoldTimeline.map(
    (blue, i) => blue - (redGoldTimeline[i] ?? 0)
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
      legend: { display: false },
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
      <div className="h-40">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
