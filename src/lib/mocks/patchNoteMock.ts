import type {
  ArenaChanges,
  ChampionChange,
  CommonChanges,
  ItemChange,
  MetaPrediction,
  PatchNoteExtended,
  SystemChange,
} from "@/types/patchnotes";

// 26.2 패치 챔피언 변경사항
const championChanges: ChampionChange[] = [
  // 버프 챔피언 (6명)
  {
    championKey: "Aatrox",
    championName: "아트록스",
    changeType: "buff",
    summary: "패시브 AP 계수 증가 및 Q 몬스터 피해량 대폭 상향",
    details: [
      { attribute: "패시브 - 죽음의 춤 AP 계수", before: "4-8%", after: "4-10% (+25%)" },
      { attribute: "Q - 다르킨의 검 몬스터 피해량", before: "15", after: "25 (+67%)" },
    ],
  },
  {
    championKey: "Ashe",
    championName: "애쉬",
    changeType: "buff",
    summary: "공격력 성장치 증가로 후반 화력 상향",
    details: [
      { attribute: "공격력 성장치", before: "3", after: "3.5 (+17%)" },
    ],
  },
  {
    championKey: "MasterYi",
    championName: "마스터 이",
    changeType: "buff",
    summary: "방어력 성장치 및 Q AD 계수 상향",
    details: [
      { attribute: "방어력 성장치", before: "4.2", after: "4.5 (+7%)" },
      { attribute: "Q - 알파 스트라이크 AD 계수", before: "65%", after: "75% (+15%)" },
    ],
  },
  {
    championKey: "Taliyah",
    championName: "탈리야",
    changeType: "buff",
    summary: "Q, E 몬스터 피해량 상향으로 정글 클리어 개선",
    details: [
      { attribute: "Q - 돌팔매 몬스터 피해량", before: "20 고정", after: "20/25/30/35/40 (레벨별)" },
      { attribute: "E - 풀린 대지 몬스터 피해량 계수", before: "190%", after: "225% (+18%)" },
    ],
  },
  {
    championKey: "Varus",
    championName: "바루스",
    changeType: "buff",
    summary: "Q 최대 충전 피해량 및 W 적중 피해량 상향",
    details: [
      { attribute: "Q - 꿰뚫는 화살 최대 충전 피해량", before: "80/150/220/290/360", after: "80/160/240/320/400 (+7~11%)" },
      { attribute: "W - 역병 화살 적중 시 피해량", before: "6/14/22/30/38", after: "8/17/26/35/44 (+16~33%)" },
    ],
  },
  {
    championKey: "Viego",
    championName: "비에고",
    changeType: "buff",
    summary: "공격 속도 성장치 및 Q 치명타 계수 대폭 상향",
    details: [
      { attribute: "공격 속도 성장치", before: "2.25%", after: "2.75% (+22%)" },
      { attribute: "Q - 군주의 지배 치명타 피해 계수(적중)", before: "50%", after: "70% (+40%)" },
      { attribute: "Q - 군주의 지배 치명타 피해 계수(시전)", before: "50%", after: "60% (+20%)" },
    ],
  },
  // 너프 챔피언 (8명)
  {
    championKey: "Gwen",
    championName: "그웬",
    changeType: "nerf",
    summary: "패시브 몬스터 피해량 상한 대폭 하향",
    details: [
      { attribute: "패시브 - 싹둑싹둑 몬스터 피해량 상한", before: "5 (+10% AP)", after: "3 (+5% AP) (-40%)" },
    ],
  },
  {
    championKey: "Jayce",
    championName: "제이스",
    changeType: "nerf",
    summary: "Q 몬스터 피해량 절반으로 감소",
    details: [
      { attribute: "Q - 하늘로/천둥의 일격 몬스터 피해량", before: "50", after: "25 (-50%)" },
    ],
  },
  {
    championKey: "Lillia",
    championName: "릴리아",
    changeType: "nerf",
    summary: "패시브 몬스터 회복 및 Q AP 계수 하향",
    details: [
      { attribute: "패시브 - 꿈의 나무 지팡이 대형 몬스터 회복 AP 계수", before: "15%", after: "9% (-40%)" },
      { attribute: "Q - 활짝 핀 꽃 AP 계수", before: "35%", after: "30% (-14%)" },
    ],
  },
  {
    championKey: "Malphite",
    championName: "말파이트",
    changeType: "nerf",
    summary: "W 몬스터 피해량, E 피해량/마나, R 쿨다운 하향",
    details: [
      { attribute: "W - 벼락 박수 몬스터 피해량", before: "2배", after: "1.8배 (-10%)" },
      { attribute: "E - 지반 분쇄 피해량", before: "80/120/160/200/240", after: "60/95/130/165/200 (-17~25%)" },
      { attribute: "E - 지반 분쇄 마나 소모", before: "50 고정", after: "50/55/60/65/70 (+0~40%)" },
      { attribute: "R - 멈출 수 없는 힘 쿨다운", before: "130/105/80초", after: "130/115/100초 (+10~25%)" },
    ],
  },
  {
    championKey: "Nunu",
    championName: "누누와 윌럼프",
    changeType: "nerf",
    summary: "Q 쿨다운 증가, W/E 피해량 하향",
    details: [
      { attribute: "Q - 먹어치우기 쿨다운", before: "12/11/10/9/8초", after: "13/12/11/10/9초 (+8~12%)" },
      { attribute: "W - 눈덩이 굴리기 최대 피해량", before: "180/225/270/315/360", after: "150/195/240/285/330 (-8~17%)" },
      { attribute: "E - 눈싸움 난사 타격당 피해량", before: "16/24/32/40/48", after: "14/21/28/35/42 (-12~13%)" },
    ],
  },
  {
    championKey: "Sivir",
    championName: "시비르",
    changeType: "nerf",
    summary: "공격 속도 및 방어력 성장치 하향",
    details: [
      { attribute: "공격 속도 성장치", before: "2%", after: "1.6% (-20%)" },
      { attribute: "방어력 성장치", before: "4.45", after: "4.0 (-10%)" },
    ],
  },
  {
    championKey: "Smolder",
    championName: "스몰더",
    changeType: "nerf",
    summary: "방어력 성장치 하향으로 생존력 감소",
    details: [
      { attribute: "방어력 성장치", before: "4.7", after: "4.0 (-15%)" },
    ],
  },
  {
    championKey: "Zed",
    championName: "제드",
    changeType: "nerf",
    summary: "패시브 몬스터 피해량 대폭 하향",
    details: [
      { attribute: "패시브 - 약자 멸시 몬스터 피해량", before: "1.8배", after: "1.2배 (-33%)" },
    ],
  },
];

// 26.2 패치 아이템 변경사항
const itemChanges: ItemChange[] = [
  // 버프 아이템 (2개)
  {
    itemId: 3124,
    itemName: "악마 학살자의 창",
    changeType: "buff",
    summary: "공격 속도, 치명타 피해량, 발동 피해 모두 상향",
    details: [
      { attribute: "공격 속도", before: "40%", after: "45% (+5%)" },
      { attribute: "보장 치명타 피해량", before: "75%", after: "80%" },
      { attribute: "치명타 발동 고정 피해", before: "10%", after: "15%" },
    ],
  },
  {
    itemId: 3508,
    itemName: "마법공학 광학 임플란트 C44",
    changeType: "buff",
    summary: "공격력 증가 및 최대 피해 발동 거리 완화",
    details: [
      { attribute: "공격력", before: "50", after: "55 (+10%)" },
      { attribute: "최대 피해 사거리 요구치", before: "700", after: "600 (더 가까운 거리에서 최대 피해)" },
    ],
  },
  // 너프 아이템 (1개)
  {
    itemId: 3070,
    itemName: "밴들의 인장",
    changeType: "nerf",
    summary: "가격 인상으로 빌드 패스 지연",
    details: [
      { attribute: "가격", before: "2,000골드", after: "2,300골드 (+300골드)" },
      { attribute: "조합 비용", before: "500골드", after: "800골드 (+300골드)" },
    ],
  },
];

// 26.2 패치 시스템 변경사항
const systemChanges: SystemChange[] = [
  {
    category: "빠른 대전",
    changeType: "adjust",
    summary: "항복 투표 가능 시점 앞당김",
    details: [
      { attribute: "항복 투표 가능 시점", before: "15분", after: "12분 (-3분)" },
    ],
  },
];

// 26.2 패치 아레나 변경사항
const arenaChanges: ArenaChanges = {
  champions: [
    // 너프 챔피언 (3명)
    {
      championKey: "Akshan",
      championName: "아센",
      changeType: "nerf",
      summary: "E 쿨다운 증가 및 R 방어구 관통력 감소",
      details: [
        { attribute: "E 쿨다운", before: "10-8초", after: "12-10초 (+20~25%)" },
        { attribute: "R 방어구 관통력", before: "10/20/30%", after: "5/15/25% (-5%p)" },
      ],
    },
    {
      championKey: "Evelynn",
      championName: "이블린",
      changeType: "nerf",
      summary: "패시브 스택 및 체력 감소량 하향",
      details: [
        { attribute: "패시브 라운드당 스택", before: "12", after: "10 (-17%)" },
        { attribute: "체력 감소", before: "250/400/550", after: "250/350/450 (-0~18%)" },
      ],
    },
    {
      championKey: "Zyra",
      championName: "자이라",
      changeType: "nerf",
      summary: "식물 지속시간 감소",
      details: [
        { attribute: "식물 지속시간", before: "8초", after: "6초 (-25%)" },
      ],
    },
    // 버프 챔피언 (2명)
    {
      championKey: "Gangplank",
      championName: "갱플랭크",
      changeType: "buff",
      summary: "패시브 및 R 쿨다운 대폭 감소",
      details: [
        { attribute: "패시브 쿨다운", before: "15초", after: "10초 (-33%)" },
        { attribute: "R 쿨다운", before: "160/140/120초", after: "130/100/90초 (-19~25%)" },
      ],
    },
    {
      championKey: "Lulu",
      championName: "룰루",
      changeType: "buff",
      summary: "Q 두 번째 탄환 피해량 증가",
      details: [
        { attribute: "Q 두 번째 탄환 피해량 증가", before: "50%", after: "75% (+50%)" },
      ],
    },
    // 조정 챔피언 (2명)
    {
      championKey: "MasterYi",
      championName: "마스터 이",
      changeType: "adjust",
      summary: "Q 쿨다운 적용 시점 버그 수정",
      details: [
        { attribute: "Q 쿨다운 적용", before: "스킬 시작 시", after: "스킬 종료 시 (버그 수정)" },
      ],
    },
    {
      championKey: "Taric",
      championName: "타릭",
      changeType: "adjust",
      summary: "패시브 스케일링 제거, 고정 피해량 상향",
      details: [
        { attribute: "패시브 피해량", before: "12.5-46.5 (스케일링 있음)", after: "25-93 (고정, 초반 상향)" },
      ],
    },
  ],
  systems: [
    {
      category: "마법 보호막",
      changeType: "adjust",
      summary: "CC 체인 지속시간 감소 완화, 발동 시 피해량 추가",
      details: [
        { attribute: "CC 체인 지속시간 감소", before: "7초당 5초", after: "7초당 4초" },
        { attribute: "발동 시 피해량", before: "없음", after: "최대 체력의 10% + 스택당 5%" },
      ],
    },
  ],
};

// 26.2 패치 메타 예측
const metaPredictions: MetaPrediction[] = [
  {
    category: "정글 메타 변화",
    predictions: [
      "그웬, 제이스, 릴리아, 말파이트, 누누, 제드의 정글 클리어 속도 대폭 하향 → 정글 티어 하락 예상",
      "아트록스, 탈리야의 정글 클리어 상향 → 정글 픽률 상승 가능",
    ],
  },
  {
    category: "원거리 딜러 메타",
    predictions: [
      "바루스, 비에고 상향 → 치명타 빌드 바루스/비에고 강세 예상",
      "시비르, 스몰더 하향 → 후반 스케일링 약화로 티어 하락",
    ],
  },
  {
    category: "아이템 영향",
    predictions: [
      "악마 학살자의 창 상향 → 온힛 + 치명타 하이브리드 빌드 강화",
      "밴들의 인장 가격 인상 → AP 정글러 빌드 패스 지연",
    ],
  },
];

// 공통 변경사항
const commonChanges: CommonChanges = {
  champions: championChanges,
  items: itemChanges,
  epicObjectives: [],
};

// 완성된 26.2 패치노트 더미데이터
export const mockPatchNote262: PatchNoteExtended = {
  version: "26.2",
  releaseDate: "2026-01-22",
  common: commonChanges,
  systems: systemChanges,
  arena: arenaChanges,
  metaPredictions: metaPredictions,
};

// 패치 버전 목록 더미데이터
export const mockPatchVersions = [
  {
    version: "26.2",
    releaseDate: "2026-01-22",
    highlights: ["정글 챔피언 대규모 조정", "바루스/비에고 상향", "아레나 밸런스 조정"],
  },
  {
    version: "26.1",
    releaseDate: "2026-01-08",
    highlights: ["신규 챔피언 출시", "아이템 리워크"],
  },
];
