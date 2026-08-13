import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getCategoryTree } from "../api/categoryApi";
import type { CategoryItem, CategoryTree } from "../types";

/**
 * 서버 캐시가 없으므로(카테고리는 매 요청 DB 조회) 이 staleTime 이 사실상
 * 유일한 캐시 계층이다. 게시판 구성은 변경 빈도가 극히 낮아 30분으로 잡았다 —
 * 새 게시판이 최대 30분 늦게 보일 수 있고 새로고침으로 즉시 해소된다.
 */
export function useCategoryTree(initialTree?: CategoryTree) {
  const locale = useLocale();
  return useQuery<CategoryTree, Error>({
    queryKey: ["community", "categories", locale],
    queryFn: () => getCategoryTree(locale),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    // 실패하면 사이드바가 통째로 비므로 목록 조회보다 재시도를 넉넉히 준다.
    retry: 2,
    // 서버가 이미 실어 보낸 트리가 있으면 스켈레톤 없이 사이드바가 바로 선다.
    initialData: initialTree,
  });
}

/**
 * id → 라벨. 숨겨진 카테고리도 해석된다(기존 글의 배지에 필요하다).
 *
 * 아직 응답이 오지 않았거나 서버가 모르는 id 면 빈 문자열을 준다. 코드 원문을
 * 돌려주던 예전과 달리 id 는 사람이 읽을 값이 아니라서, 숫자가 배지에 노출되느니
 * 잠깐 비는 편이 낫다.
 */
export function useCategoryLabel() {
  const { data } = useCategoryTree();
  return useMemo(() => {
    const all = data?.groups.flatMap((group) => group.categories) ?? [];
    const map = new Map(all.map((category) => [category.id, category.name]));
    return (categoryId: number) => map.get(categoryId) ?? "";
  }, [data]);
}

/**
 * 사이드바·필터칩용 평평한 목록. 모바일 가로 스크롤 탭처럼 그룹 구분 없이
 * 늘어놓는 자리에서만 쓴다. 순서는 서버가 준 그룹 순서를 그대로 따른다.
 */
export function useVisibleCategories(): CategoryItem[] {
  const { data } = useCategoryTree();
  return useMemo(
    () =>
      data?.groups.flatMap((group) =>
        group.categories.filter((category) => category.visible)
      ) ?? [],
    [data]
  );
}

/** 글쓰기 셀렉트용. 숨김이거나 읽기 전용인 게시판은 제외한다. */
export function useWritableCategories(): CategoryItem[] {
  const { data } = useCategoryTree();
  return useMemo(
    () =>
      data?.groups.flatMap((group) =>
        group.categories.filter(
          (category) => category.visible && category.writable
        )
      ) ?? [],
    [data]
  );
}
