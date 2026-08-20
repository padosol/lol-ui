"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

/**
 * 게시글 본문 렌더러.
 *
 * ## 왜 마크다운인가
 * 이미지를 본문 원하는 위치에 넣으려면 본문이 구조를 가져야 한다. 이전에는
 * `whitespace-pre-wrap` 으로 평문을 그대로 뿌렸기 때문에 `![](url)` 을 넣어도
 * 그 문자열이 화면에 그대로 보였다.
 *
 * ## 안전장치
 * - **원시 HTML 을 렌더링하지 않는다.** react-markdown 은 기본적으로 HTML 을 텍스트로
 *   취급하며, 이를 켜는 `rehype-raw` 를 <b>의도적으로 넣지 않았다.</b> 사용자 본문에
 *   `<script>` 나 `onerror=` 가 들어와도 문자로만 남는다.
 * - **위험한 URL 스킴 차단.** react-markdown 의 기본 `urlTransform` 이 `javascript:` 같은
 *   스킴을 걸러낸다. 기본값을 덮어쓰지 않는 것이 곧 방어다.
 * - 외부 링크에는 `noopener noreferrer nofollow` 를 붙인다.
 *
 * ## 기존 글 호환
 * `remark-breaks` 를 넣은 이유는 순전히 회귀 방지다. 마크다운은 홑 줄바꿈을 공백으로
 * 합치는데, 이 기능 이전의 글은 전부 평문 + `whitespace-pre-wrap` 으로 쓰였다.
 * 이 플러그인이 없으면 <b>기존 글의 줄바꿈이 전부 사라진다.</b>
 */
const components: Components = {
  img: ({ src, alt }) => (
    // next/image 를 쓰지 않는다. 본문 이미지는 크기를 미리 알 수 없고(마크다운에 치수가
    // 없다), CDN 도메인이 환경마다 달라 remotePatterns 를 고정하기 어렵다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      loading="lazy"
      className="my-3 h-auto max-w-full rounded-lg border border-divider"
    />
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h2 className="mt-5 mb-2 text-lg font-bold text-on-surface">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="mt-5 mb-2 text-base font-bold text-on-surface">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-4 mb-2 text-[15px] font-bold text-on-surface">{children}</h4>
  ),
  ul: ({ children }) => <ul className="my-3 list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal pl-5">{children}</ol>,
  li: ({ children }) => <li className="my-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-divider pl-3 text-on-surface-disabled">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-4 px-1.5 py-0.5 text-[13px]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg bg-surface-4 p-3 text-[13px]">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-5 border-divider" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-divider px-2 py-1 text-left font-bold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-divider px-2 py-1">{children}</td>
  ),
};

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className="py-6 text-[15px] leading-[1.85] text-on-surface-medium">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
