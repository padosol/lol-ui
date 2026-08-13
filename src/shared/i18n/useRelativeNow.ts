"use client";

import { useNow } from "next-intl";

/** 1분. 상대시간 표기가 분 단위라 그보다 촘촘히 갱신할 이유가 없다. */
const UPDATE_INTERVAL = 60 * 1000;

/**
 * `format.relativeTime` 에 넘길 기준 시각.
 *
 * 기준 시각을 넘기지 않으면 next-intl 이 매 렌더마다 현재 시각으로 폴백하면서
 * ENVIRONMENT_FALLBACK 경고를 띄운다. 그리고 화면을 열어둔 채로 시간이 흘러도
 * "1분 전" 이 그대로 남는다. 여기서 주기적으로 기준 시각을 새로 잡아 둘 다 해결한다.
 *
 * 갱신은 useNow 내부의 effect 에서 일어나므로 첫 렌더 값은 그대로 두고,
 * 서버 렌더를 타는 화면에서도 하이드레이션 시점의 마크업이 어긋나지 않는다.
 */
export function useRelativeNow() {
  return useNow({ updateInterval: UPDATE_INTERVAL });
}
