import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import PostContent from "./PostContent";

function render(md: string): string {
  return renderToStaticMarkup(
    // createElement 의 자식 인자로는 NextIntlClientProvider 의 오버로드가 맞지 않는다.
    // eslint-disable-next-line react/no-children-prop
    createElement(NextIntlClientProvider, {
      locale: "ko",
      messages: {},
      children: createElement(PostContent, { content: md }),
    }),
  );
}

function cardCount(html: string): number {
  return (html.match(/class="x-post-embed"/g) ?? []).length;
}

const URL_ = "https://x.com/LoLDev/status/1";

describe("PostContent X 카드", () => {
  it.each([
    ["단독 줄", URL_, 1],
    ["앞뒤 문단 사이", `요약\n\n${URL_}\n\n아래`, 1],
    ["두 개", `${URL_}\n\n${URL_.replace("1", "2")}`, 2],
    ["쿼리 붙은 원문", `${URL_}?s=20`, 1],
    ["twitter.com", "https://twitter.com/LoLDev/status/1", 1],
    ["문장 속", `출처 ${URL_} 참고`, 0],
    ["텍스트를 단 링크", `[출처](${URL_})`, 0],
    ["인용문 안", `> ${URL_}`, 0],
    ["목록 안", `- ${URL_}`, 0],
    ["느슨한 목록 안", `- 하나\n\n- ${URL_}`, 0],
    ["X 가 아닌 링크", "https://example.com/a", 0],
  ])("%s → 카드 %i 개", (_name, md, count) => {
    expect(cardCount(render(md))).toBe(count);
  });

  it("카드 문단은 <p> 로 감싸지 않는다", () => {
    expect(render(URL_)).not.toMatch(/<p[^>]*>\s*<div class="x-post-embed"/);
  });
});
