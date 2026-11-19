/** X(구 Twitter) 게시물을 가리키는 URL 에서 뽑아낸 참조 정보. */
export interface XPostRef {
  id: string;
  /** `/i/status/<id>` 형태처럼 작성자를 알 수 없으면 null. */
  handle: string | null;
  /** 항상 `https://x.com/...` 로 정규화한 주소. */
  canonicalUrl: string;
}

const ALLOWED_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
]);

const HANDLE_PATTERN = /^[A-Za-z0-9_]{1,15}$/;
const NUMERIC_PATTERN = /^\d{1,20}$/;

/** URL 이 X 게시물이면 표준형 참조를, 아니면 null 을 돌려준다. */
export function parseXPostUrl(input: string): XPostRef | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split("/").filter(Boolean);

  // /i/status/<id>, /i/web/status/<id>
  if (segments[0] === "i") {
    const rest = segments[1] === "web" ? segments.slice(2) : segments.slice(1);
    if (rest.length === 2 && rest[0] === "status" && NUMERIC_PATTERN.test(rest[1])) {
      return { id: rest[1], handle: null, canonicalUrl: `https://x.com/i/status/${rest[1]}` };
    }
    return null;
  }

  // /<handle>/status/<id>[/photo|video/<n>]
  const [handle, status, id, media, n] = segments;
  if (!handle || !HANDLE_PATTERN.test(handle)) return null;
  if (status !== "status" || !id || !NUMERIC_PATTERN.test(id)) return null;

  if (segments.length === 5) {
    if ((media !== "photo" && media !== "video") || !NUMERIC_PATTERN.test(n)) return null;
  } else if (segments.length !== 3) {
    return null;
  }

  return { id, handle, canonicalUrl: `https://x.com/${handle}/status/${id}` };
}

/** 링크 텍스트가 href 와 같은(=URL 만 붙여 넣은) X 게시물 링크일 때만 참조를 돌려준다. */
export function matchBareXPostLink(
  href: string | null | undefined,
  text: string,
): XPostRef | null {
  if (!href || text.trim() !== href) return null;
  return parseXPostUrl(href);
}
