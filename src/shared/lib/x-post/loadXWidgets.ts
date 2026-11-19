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

/**
 * 스크립트가 load 도 error 도 내지 않고 매달리면(차단 프록시, 끊긴 연결) 카드가 영영
 * 로딩 자리로 남는다. 이만큼 기다려도 준비되지 않으면 실패로 보고 링크를 보인다.
 */
export const X_WIDGETS_TIMEOUT_MS = 10_000;

// 실패한 Promise 도 그대로 캐시해서 script 를 다시 넣지 않는다. 시간 초과도 실패다.
let widgetsPromise: Promise<XWidgetsApi> | null = null;

export function loadXWidgets(): Promise<XWidgetsApi> {
  if (widgetsPromise) return widgetsPromise;

  widgetsPromise = new Promise<XWidgetsApi>((resolve, reject) => {
    const fail = (message: string) => {
      clearTimeout(timer);
      reject(new Error(message));
    };
    // twttr.ready 까지 기다린다. load 뒤에 ready 가 오지 않아도 같은 이유로 실패다.
    const timer = setTimeout(
      () => fail("X 위젯 스크립트가 시간 안에 준비되지 않았습니다."),
      X_WIDGETS_TIMEOUT_MS,
    );

    const script = document.createElement("script");
    script.src = X_WIDGETS_SRC;
    script.async = true;
    script.charset = "utf-8";
    script.addEventListener("load", () => {
      if (!window.twttr) {
        fail("X 위젯 스크립트를 불러왔지만 twttr 가 없습니다.");
        return;
      }
      window.twttr.ready((api) => {
        clearTimeout(timer);
        resolve(api);
      });
    });
    script.addEventListener("error", () => {
      fail("X 위젯 스크립트를 불러오지 못했습니다.");
    });
    document.head.appendChild(script);
  });

  return widgetsPromise;
}
