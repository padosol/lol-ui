import { describe, expect, it } from "vitest";
import { matchBareXPostLink, parseXPostUrl } from "./parseXPostUrl";

/**
 * X 게시물 URL 인식 규칙을 본다.
 *
 * <p>뷰어와 에디터가 같은 규칙으로 "이 URL 이 X 게시물인가"를 판단해야 하므로 규칙을
 * 한 곳에 두고 여기서 고정한다. 유사 도메인·스킴 위조 같은 거부 케이스가 핵심이다.
 */
describe("parseXPostUrl", () => {
  it.each([
    ["https://x.com/LoLDev/status/1234567890123456789", "LoLDev", "1234567890123456789"],
    ["https://twitter.com/LoLDev/status/1", "LoLDev", "1"],
    ["https://mobile.twitter.com/LoLDev/status/1", "LoLDev", "1"],
    ["https://www.x.com/LoLDev/status/1/", "LoLDev", "1"],
    ["http://x.com/LoLDev/status/1", "LoLDev", "1"],
    ["https://X.COM/LoLDev/status/1", "LoLDev", "1"],
    ["https://x.com/LoLDev/status/1?s=20&t=abc", "LoLDev", "1"],
    ["https://x.com/LoLDev/status/1/photo/1", "LoLDev", "1"],
    ["https://x.com/LoLDev/status/1/video/2", "LoLDev", "1"],
  ])("%s 를 받는다", (input, handle, id) => {
    expect(parseXPostUrl(input)).toEqual({
      id,
      handle,
      canonicalUrl: `https://x.com/${handle}/status/${id}`,
    });
  });

  it.each(["https://x.com/i/web/status/9", "https://x.com/i/status/9"])(
    "%s 는 handle 없이 표준형이 된다",
    (input) => {
      expect(parseXPostUrl(input)).toEqual({
        id: "9",
        handle: null,
        canonicalUrl: "https://x.com/i/status/9",
      });
    },
  );

  it.each([
    "https://x.com/LoLDev", // 프로필
    "https://x.com/search?q=lol", // 검색
    "https://x.com/hashtag/LCK", // 해시태그
    "https://x.com/LoLDev/status/abc", // 숫자 아닌 id
    "https://x.com/LoLDev/status/1/likes", // 허용하지 않는 꼬리
    "https://x.com.evil.com/LoLDev/status/1", // 유사 도메인
    "https://notx.com/LoLDev/status/1",
    "https://evil.com/x.com/LoLDev/status/1",
    "javascript:alert(1)//x.com/LoLDev/status/1",
    "ftp://x.com/LoLDev/status/1",
    "x.com/LoLDev/status/1", // 스킴 없음
    "",
  ])("%s 는 거부한다", (input) => {
    expect(parseXPostUrl(input)).toBeNull();
  });
});

describe("matchBareXPostLink", () => {
  const url = "https://x.com/LoLDev/status/1";
  it("텍스트가 href 와 같으면 받는다", () => {
    expect(matchBareXPostLink(url, url)?.id).toBe("1");
  });
  it("텍스트를 단 링크는 거부한다", () => {
    expect(matchBareXPostLink(url, "출처")).toBeNull();
  });
  it("href 가 없으면 거부한다", () => {
    expect(matchBareXPostLink(undefined, url)).toBeNull();
  });

  // 뷰어(remark-gfm)의 자동 링크는 이 글자들로 끝나는 URL 에서 끝 글자를 링크 밖으로 뺀다.
  // 에디터(markdown-it linkify)는 `_`·`~` 를 링크에 넣는다. 둘 다 링크로 두어야 같게 보인다.
  it.each(["?", "!", ".", ",", ":", "*", "_", "~"])(
    "href 가 %s 로 끝나면 거부한다",
    (last) => {
      const href = `${url}?t=abc${last}`;
      // 전제: 주소 자체는 X 게시물이다. 거부는 끝 글자 규칙 때문이어야 한다.
      expect(parseXPostUrl(href)).not.toBeNull();
      expect(matchBareXPostLink(href, href)).toBeNull();
    },
  );

  it.each([`${url}?t=abc-`, `${url}?s=20`, `${url}/`, `${url}?t=a_b~c`])(
    "%s 처럼 다른 글자로 끝나면 받는다",
    (href) => {
      expect(matchBareXPostLink(href, href)?.id).toBe("1");
    },
  );
});
