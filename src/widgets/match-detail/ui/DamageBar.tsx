"use client";

interface DamageBarProps {
  label: string;
  percentage: number;
  value: string;
  color: "orange" | "blue" | "red" | "lime";
}

export default function DamageBar({
  label,
  percentage,
  value,
  color,
}: DamageBarProps) {
  // Material Design 2 desaturated colors
  const colorClasses = {
    orange: {
      bar: "bg-warning/70",
      text: "text-warning",
    },
    blue: {
      bar: "bg-primary/70",
      text: "text-primary",
    },
    red: {
      bar: "bg-loss/70",
      text: "text-loss",
    },
    lime: {
      bar: "bg-success/70",
      text: "text-success",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="flex flex-col flex-1">
      {/* 상단: 라벨 */}
      <div className="text-on-surface-medium text-[9px]">{label}</div>
      {/* 하단: 바 + 데미지 */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-surface-8/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className={`${colors.text} text-[9px] w-7 text-right shrink-0`}>
          {value}
        </div>
      </div>
    </div>
  );
}
