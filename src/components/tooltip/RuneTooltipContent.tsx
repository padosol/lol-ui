"use client";

const RUNE_TREE_NAMES: Record<number, string> = {
  8000: "정밀",
  8100: "지배",
  8200: "마법",
  8300: "영감",
  8400: "결의",
};

const KEYSTONE_NAMES: Record<number, string> = {
  // 정밀
  8005: "집중 공격",
  8008: "치명적 속도",
  8021: "기민한 발놀림",
  8010: "정복자",
  // 지배
  8112: "감전",
  8124: "포식자",
  8128: "어둠의 수확",
  9923: "칼날비",
  // 마법
  8214: "신비로운 유성",
  8229: "위상 변화",
  8230: "난입",
  // 영감
  8351: "빙결 강화",
  8360: "비공식 빙결",
  8369: "선제 공격",
  // 결의
  8437: "착취의 손아귀",
  8439: "여진",
  8465: "수호자",
  // 소룬들
  8009: "과잉 치유",
  8014: "비겁한 일격",
  8017: "최후의 일격",
  8044: "전설: 난투",
  8226: "마나순환 팔찌",
  8243: "주문 작열",
  8275: "절대 집중",
  8299: "최후의 저항",
  8304: "마법의 신발",
  8313: "완벽한 타이밍",
  8316: "미니언 해체분석기",
  8321: "쿠키 배달",
  8345: "우주적 통찰력",
  8347: "접근 금지",
  8410: "뼈 방패",
  8429: "사전 준비",
  8444: "보호막 강타",
  8446: "과잉 성장",
  8451: "강인함",
  8453: "활력",
  8463: "불굴의 의지",
  9101: "과잉 치유",
  9104: "전설: 민첩함",
  9105: "전설: 강인함",
  9111: "승전보",
};

interface RuneTooltipContentProps {
  runeId: number;
}

export default function RuneTooltipContent({ runeId }: RuneTooltipContentProps) {
  const name = KEYSTONE_NAMES[runeId];
  const treeId = Math.floor(runeId / 100) * 100;
  const treeName = RUNE_TREE_NAMES[treeId];

  return (
    <div className="bg-surface-1 border border-divider shadow-xl rounded-lg p-2.5 max-w-[200px]">
      <div className="text-on-surface font-bold text-xs">
        {name || `룬 ${runeId}`}
      </div>
      {treeName && (
        <div className="text-on-surface-medium text-[10px] mt-0.5">{treeName}</div>
      )}
    </div>
  );
}
