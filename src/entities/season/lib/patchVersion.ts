/**
 * 패치 버전 문자열("16.9", "16.14")을 숫자 세그먼트 단위로 비교한다.
 * 사전순 비교면 "16.9" > "16.14" 가 되어버리므로 직접 나눠서 본다.
 */
export function comparePatchVersion(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (Number.isNaN(l) || Number.isNaN(r)) {
      // 숫자로 파싱되지 않는 버전은 사전순으로 떨어뜨린다
      return a.localeCompare(b);
    }
    if (l !== r) return l - r;
  }

  return 0;
}

/** 정렬 순서를 신뢰하지 않고 목록에서 최신 패치를 고른다. */
export function pickLatestPatchVersion(
  patchVersions: readonly string[] | undefined
): string | null {
  if (!patchVersions || patchVersions.length === 0) return null;

  return patchVersions.reduce((latest, current) =>
    comparePatchVersion(current, latest) > 0 ? current : latest
  );
}
