export const X_WIDGETS_SRC = "https://platform.twitter.com/widgets.js";

export interface XTweetOptions {
  theme?: "dark" | "light";
  lang?: string;
  dnt?: boolean;
  conversation?: "none" | "all";
  align?: "left" | "center" | "right";
}

export interface XWidgetsApi {
  widgets: {
    createTweet(
      id: string,
      target: HTMLElement,
      options?: XTweetOptions,
    ): Promise<HTMLElement | undefined>;
  };
  ready(callback: (api: XWidgetsApi) => void): void;
}

declare global {
  interface Window {
    twttr?: XWidgetsApi;
  }
}

// 실패한 Promise 도 그대로 캐시해서 script 를 다시 넣지 않는다.
let widgetsPromise: Promise<XWidgetsApi> | null = null;

export function loadXWidgets(): Promise<XWidgetsApi> {
  if (widgetsPromise) return widgetsPromise;

  widgetsPromise = new Promise<XWidgetsApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = X_WIDGETS_SRC;
    script.async = true;
    script.charset = "utf-8";
    script.addEventListener("load", () => {
      if (!window.twttr) {
        reject(new Error("X 위젯 스크립트를 불러왔지만 twttr 가 없습니다."));
        return;
      }
      window.twttr.ready(resolve);
    });
    script.addEventListener("error", () => {
      reject(new Error("X 위젯 스크립트를 불러오지 못했습니다."));
    });
    document.head.appendChild(script);
  });

  return widgetsPromise;
}
