import { loadXWidgets, type XWidgetsApi } from "./loadXWidgets";

export type XPostRenderResult = "ready" | "failed" | "aborted";

/**
 * target 안의 호출마다 새로 만든 자식 슬롯에 X 게시물 카드를 그린다.
 * 시작할 때 이전 카드를 지우고, 중단되거나 실패하면 자기 슬롯만 걷어낸다.
 * 늦게 끝난 오래된 렌더가 같은 target 에 새로 그린 카드를 지우지 않게 하려는 것이다.
 */
export async function renderXPost(
  target: HTMLElement,
  id: string,
  options: { theme: "dark" | "light"; lang: string },
  signal: AbortSignal,
  load: () => Promise<XWidgetsApi> = loadXWidgets,
): Promise<XPostRenderResult> {
  if (signal.aborted) return "aborted";

  const slot = document.createElement("div");
  target.replaceChildren(slot);

  let api: XWidgetsApi;
  try {
    api = await load();
  } catch {
    slot.remove();
    return "failed";
  }
  if (signal.aborted) {
    slot.remove();
    return "aborted";
  }

  try {
    const element = await api.widgets.createTweet(id, slot, {
      theme: options.theme,
      lang: options.lang,
      dnt: true,
      conversation: "none",
      align: "center",
    });
    if (signal.aborted) {
      slot.remove();
      return "aborted";
    }
    if (!element) {
      slot.remove();
      return "failed";
    }
    return "ready";
  } catch {
    slot.remove();
    return "failed";
  }
}
