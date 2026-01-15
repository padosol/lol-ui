"use client";

interface RankingFiltersProps {
  region: string;
  queueType: string;
  onRegionChange: (region: string) => void;
  onQueueTypeChange: (queueType: string) => void;
}

const regions = [
  { value: "kr", label: "한국" },
  { value: "na", label: "북미" },
  { value: "euw", label: "유럽 서부" },
  { value: "eune", label: "유럽 동북" },
  { value: "jp", label: "일본" },
];

const queueTypes = [
  { value: "solo", label: "솔로랭크" },
  { value: "flex", label: "자유랭크" },
];

// 더미 데이터 - 실제 데이터로 교체 필요
const getTierInfo = (_region: string, _queueType: string) => {
  return {
    challenger: {
      cutoff: 1200,
      players: 300,
    },
    grandmaster: {
      cutoff: 1000,
      players: 1000,
    },
  };
};

export default function RankingFilters({
  region,
  queueType,
  onRegionChange,
  onQueueTypeChange,
}: RankingFiltersProps) {
  const tierInfo = getTierInfo(region, queueType);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-3 gap-4">
        {/* 1섹션: 지역, 랭킹 타입 */}
        <div className="flex gap-4">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              지역
            </label>
            <select
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              랭킹 타입
            </label>
            <select
              value={queueType}
              onChange={(e) => onQueueTypeChange(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {queueTypes.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2섹션: 비워둠 */}
        <div></div>

        {/* 3섹션: 챌린저/그랜드마스터 정보 */}
        <div className="flex gap-3 justify-end">
          <div className="bg-gray-700 rounded-md p-3 w-40">
            <div className="text-xs text-gray-400 mb-1">챌린저</div>
            <div className="text-sm text-gray-300">
              커트라인: <span className="font-semibold text-white">{tierInfo.challenger.cutoff} LP</span>
            </div>
            <div className="text-sm text-gray-300">
              인원: <span className="font-semibold text-white">{tierInfo.challenger.players}명</span>
            </div>
          </div>
          <div className="bg-gray-700 rounded-md p-3 w-40">
            <div className="text-xs text-gray-400 mb-1">그랜드마스터</div>
            <div className="text-sm text-gray-300">
              커트라인: <span className="font-semibold text-white">{tierInfo.grandmaster.cutoff} LP</span>
            </div>
            <div className="text-sm text-gray-300">
              인원: <span className="font-semibold text-white">{tierInfo.grandmaster.players}명</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

