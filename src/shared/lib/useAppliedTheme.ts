import { useCallback, useSyncExternalStore, type RefObject } from "react";

/**
 * 지금 화면에 실제로 적용된 테마("dark" | "light")를 돌려준다.
 *
 * ## 왜 useThemeStore 를 쓰지 않나
 * shared 는 features 를 import 할 수 없다(FSD). 그리고 스토어 값은 "사용자가 고른
 * 테마"일 뿐 "이 자리에 적용된 테마"가 아니다. 헤더처럼 `.theme-dark` 가 붙은 하위
 * 트리는 전역 테마가 light 여도 어둡다. 그래서 DOM 을 직접 본다.
 *
 * ## 판정 순서
 * 1. 조상에 `.theme-dark` 가 있으면 dark.
 * 2. 아니면 `<html>` 에 `light` 클래스가 있을 때만 light, 그 밖은 dark(스토어 기본값).
 *
 * 서버와 첫 하이드레이션 렌더는 항상 "dark" 다. 클라이언트에서 이어 붙은 뒤에
 * 실제 값으로 바뀌고, `<html>` class 변화는 MutationObserver 로 따라간다.
 */
export function useAppliedTheme(
  ref: RefObject<HTMLElement | null>,
): "dark" | "light" {
  const subscribe = useCallback((onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const getSnapshot = useCallback((): "dark" | "light" => {
    if (ref.current?.closest(".theme-dark")) return "dark";
    return document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
  }, [ref]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot(): "dark" {
  return "dark";
}
