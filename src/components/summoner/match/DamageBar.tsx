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
  const colorClasses = {
    orange: {
      bar: "bg-orange-400/70",
      text: "text-orange-300",
    },
    blue: {
      bar: "bg-blue-400/70",
      text: "text-blue-300",
    },
    red: {
      bar: "bg-red-400/70",
      text: "text-red-300",
    },
    lime: {
      bar: "bg-lime-400/70",
      text: "text-lime-300",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="flex flex-col flex-1">
      {/* 상단: 라벨 */}
      <div className="text-gray-400 text-[9px]">{label}</div>
      {/* 하단: 바 + 데미지 */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
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
