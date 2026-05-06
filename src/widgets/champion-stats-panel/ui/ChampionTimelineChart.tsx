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
import type { TimelineFrame } from "@/entities/champion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

type Metric = "gold" | "cs" | "xp";

interface ChampionTimelineChartProps {
  frames: TimelineFrame[];
}

const METRIC_LABEL: Record<Metric, string> = {
  gold: "평균 골드",
  cs: "평균 CS",
  xp: "평균 경험치",
};

const METRIC_COLOR: Record<Metric, { line: string; fill: string }> = {
  gold: { line: "rgba(255, 213, 79, 0.95)", fill: "rgba(255, 213, 79, 0.15)" },
  cs: { line: "rgba(76, 175, 80, 0.95)", fill: "rgba(76, 175, 80, 0.15)" },
  xp: { line: "rgba(102, 187, 255, 0.95)", fill: "rgba(102, 187, 255, 0.15)" },
};

function formatValue(metric: Metric, value: number): string {
  if (metric === "cs") return value.toFixed(1);
  return Math.round(value).toLocaleString();
}

function MiniChart({
  metric,
  frames,
}: {
  metric: Metric;
  frames: TimelineFrame[];
}) {
  const labels = frames.map((f) => `${f.minute}분`);
  const values = frames.map((f) =>
    metric === "gold" ? f.avgGold : metric === "cs" ? f.avgCs : f.avgXp
  );
  const samples = frames.map((f) => f.sampleSize);
  const colors = METRIC_COLOR[metric];

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: colors.line,
        backgroundColor: colors.fill,
        borderWidth: 2,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        pointBackgroundColor: colors.line,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: colors.line,
        pointHoverBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        padding: 8,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y ?? 0;
            const sample = samples[ctx.dataIndex] ?? 0;
            return [
              `${METRIC_LABEL[metric]} ${formatValue(metric, value)}`,
              `표본 ${sample.toLocaleString()}`,
            ];
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
        },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "rgba(255,255,255,0.4)",
          font: { size: 10 },
          callback: (value) => {
            const v = Number(value);
            if (metric === "cs") return v.toFixed(0);
            if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
            return String(v);
          },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="bg-surface rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-on-surface">
          {METRIC_LABEL[metric]}
        </span>
      </div>
      <div className="h-32 sm:h-36">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default function ChampionTimelineChart({
  frames,
}: ChampionTimelineChartProps) {
  const safeFrames = frames.filter((f) => f.sampleSize > 0);

  if (safeFrames.length === 0) {
    return (
      <div className="bg-surface-1 rounded-lg border border-divider p-3 sm:p-5">
        <h3 className="text-base font-bold text-on-surface p-2">
          시간대별 평균
        </h3>
        <p className="text-center text-on-surface-medium text-sm py-8">
          표본 부족으로 시간대별 데이터가 없습니다.
        </p>
      </div>
    );
  }

  const minSample = Math.min(...safeFrames.map((f) => f.sampleSize));

  return (
    <div className="bg-surface-1 rounded-lg border border-divider p-3 sm:p-5">
      <div className="flex items-end justify-between p-2">
        <h3 className="text-base font-bold text-on-surface">시간대별 평균</h3>
        <span className="text-[11px] text-on-surface-medium">
          최소 표본 {minSample.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MiniChart metric="gold" frames={safeFrames} />
        <MiniChart metric="cs" frames={safeFrames} />
        <MiniChart metric="xp" frames={safeFrames} />
      </div>
    </div>
  );
}
