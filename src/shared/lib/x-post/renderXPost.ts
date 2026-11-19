import { loadXWidgets, type XWidgetsApi } from "./loadXWidgets";

export type XPostRenderResult = "ready" | "failed" | "aborted";

/**
 * target 에 X 게시물 카드를 그린다. 시작할 때, 그리다 중단되거나 실패했을 때
 * target 을 비워 반쯤 그려진 카드가 남지 않게 한다.
 */
export async function renderXPost(
  target: HTMLElement,
  id: string,
  options: { theme: "dark" | "light"; lang: string },
  signal: AbortSignal,
  load: () => Promise<XWidgetsApi> = loadXWidgets,
): Promise<XPostRenderResult> {
  target.replaceChildren();

  let api: XWidgetsApi;
  try {
    api = await load();
  } catch {
    return "failed";
  }
  if (signal.aborted) return "aborted";

  try {
    const element = await api.widgets.createTweet(id, target, {
      theme: options.theme,
      lang: options.lang,
      dnt: true,
      conversation: "none",
      align: "center",
    });
    if (signal.aborted) {
      target.replaceChildren();
      return "aborted";
    }
    if (!element) {
      target.replaceChildren();
      return "failed";
    }
    return "ready";
  } catch {
    target.replaceChildren();
    return "failed";
  }
}
