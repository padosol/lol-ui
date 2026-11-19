import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import XPostEmbed from "./XPostEmbed";

/** 효과(effect)는 SSR 에서 돌지 않으므로 여기서는 처음 내보내는 마크업만 본다. */
function render(url: string): string {
  return renderToStaticMarkup(
    // createElement 의 자식 인자로는 NextIntlClientProvider 의 오버로드가 맞지 않는다.
    // eslint-disable-next-line react/no-children-prop
    createElement(NextIntlClientProvider, {
      locale: "ko",
      messages: {},
      children: createElement(XPostEmbed, { url }),
    }),
  );
}

describe("XPostEmbed", () => {
  it("처음에는 대체 링크와 idle 상태를 낸다", () => {
    const html = render("https://x.com/LoLDev/status/1?s=20");
    expect(html).toContain('class="x-post-embed"');
    expect(html).toContain('data-state="idle"');
    expect(html).toContain('class="x-post-embed__frame"');
    expect(html).toContain('href="https://x.com/LoLDev/status/1?s=20"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it("X 게시물이 아니면 카드 상자 없이 링크만 낸다", () => {
    const html = render("https://example.com/a");
    expect(html).not.toContain("x-post-embed__frame");
    expect(html).toContain('href="https://example.com/a"');
  });
});
