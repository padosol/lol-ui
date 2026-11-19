"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { parseXPostUrl, renderXPost } from "@/shared/lib/x-post";
import { useAppliedTheme } from "@/shared/lib/useAppliedTheme";

const subscribeNothing = () => () => {};
const lacksObserver = () => typeof IntersectionObserver === "undefined";
const assumeObserver = () => false;

type EmbedState = "idle" | "loading" | "ready" | "failed";

/**
 * X 게시물 링크를 카드로 바꿔 보여준다.
 *
 * ## 왜 링크로 시작하나
 * 카드는 외부 스크립트(widgets.js)가 그린다. 그 스크립트가 막히거나 느려도 글은
 * 읽혀야 하므로 서버가 내는 마크업은 항상 "원문 링크"다. 카드가 그려지면(ready)
 * 링크는 걷고, 실패하면 링크가 그 자리를 지킨다.
 *
 * ## 왜 화면에 들어올 때까지 기다리나
 * 게시글 하나에 카드가 여러 장일 수 있다. 스크롤 전에는 스크립트도 카드도 부르지
 * 않아 첫 로딩 비용을 아낀다. 한 번 보이면 다시 되돌리지 않는다.
 */
export default function XPostEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const lang = useLocale();
  const theme = useAppliedTheme(ref);
  const id = parseXPostUrl(url)?.id ?? null;

  const [seen, setSeen] = useState(false);
  // 관찰할 수 없는 환경에서는 기다릴 이유가 없으니 바로 보이는 것으로 친다.
  // 서버·하이드레이션 첫 렌더는 항상 "관찰 가능"으로 읽어 마크업이 어긋나지 않게 한다.
  const noObserver = useSyncExternalStore(
    subscribeNothing,
    lacksObserver,
    assumeObserver,
  );
  const visible = seen || noObserver;
  // 결과에 "어떤 조건으로 그렸는지"(key)를 같이 적어 둔다. 조건이 바뀌면 이전 결과는
  // 자동으로 무효가 되어 loading 으로 읽히므로, effect 안에서 state 를 먼저 비울 필요가 없다.
  const key = `${id}|${theme}|${lang}`;
  const [result, setResult] = useState<{
    key: string;
    value: "ready" | "failed";
  } | null>(null);
  const state: EmbedState =
    !visible || !id
      ? "idle"
      : result?.key === key
        ? result.value
        : "loading";

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!visible || !id || !frame) return;

    // 테마·언어가 바뀌면 같은 자리에 다시 그린다. 이전 렌더는 abort 로 끊는다.
    const controller = new AbortController();
    renderXPost(frame, id, { theme, lang }, controller.signal).then(
      (value) => {
        // 끊긴 렌더의 결과가 새 렌더의 상태를 덮어쓰지 않게 한다.
        if (value !== "aborted") setResult({ key, value });
      },
    );
    return () => {
      controller.abort();
      frame.replaceChildren();
    };
  }, [visible, id, theme, lang, key]);

  // X 게시물이 아니면 카드 상자 없이 링크만 둔다.
  if (!id) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer nofollow">
        {url}
      </a>
    );
  }

  return (
    <div className="x-post-embed" data-state={state} ref={ref}>
      <div className="x-post-embed__frame" ref={frameRef} />
      {state !== "ready" && (
        <a
          className="x-post-embed__link"
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {url}
        </a>
      )}
    </div>
  );
}
