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
 * ## 스타일은 여기 없다
 * 타이포그래피는 `.post-prose`(shared/styles/postProse.css)가 가진다. 에디터가 같은
 * 클래스를 쓰기 때문이다 — 스타일이 두 곳에 나뉘면 "쓰는 화면"과 "보이는 화면"이
 * 조금씩 어긋나고, 그 어긋남은 아무도 버그로 신고하지 않는다.
 *
 * <p>아래 components 에 남은 것은 <b>스타일이 아니라 동작·구조</b>다: 지연 로딩,
 * 외부 링크 rel, 제목 단계 낮추기, 표 가로 스크롤.
 *
 * ## 안전장치
 * - **원시 HTML 을 렌더링하지 않는다.** react-markdown 은 기본적으로 HTML 을 텍스트로
 *   취급하며, 이를 켜는 `rehype-raw` 를 <b>의도적으로 넣지 않았다.</b> 사용자 본문에
 *   `<script>` 나 `onerror=` 가 들어와도 문자로만 남는다. 에디터도 같은 선을 지킨다
 *   (tiptap-markdown 의 `html: false` — usePostEditor 참고).
 * - **위험한 URL 스킴 차단.** react-markdown 의 기본 `urlTransform` 이 `javascript:` 같은
 *   스킴을 걸러낸다. 기본값을 덮어쓰지 않는 것이 곧 방어다.
 * - 외부 링크에는 `noopener noreferrer nofollow` 를 붙인다.
 *
 * ## 기존 글 호환
 * `remark-breaks` 를 넣은 이유는 순전히 회귀 방지다. 마크다운은 홑 줄바꿈을 공백으로
 * 합치는데, 이 기능 이전의 글은 전부 평문 + `whitespace-pre-wrap` 으로 쓰였다.
 * 이 플러그인이 없으면 <b>기존 글의 줄바꿈이 전부 사라진다.</b> 에디터의
 * `breaks: true` 도 같은 약속을 지키기 위한 것이다.
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
    />
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  ),
  // 게시글 제목이 이미 페이지의 h1 이다(PostDetailPanel). 본문 제목을 한 단계 내려
  // 한 문서에 h1 이 둘이 되는 것을 막는다. 에디터도 같은 태그를 낸다(PostHeading).
  h1: ({ children }) => <h2>{children}</h2>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4>{children}</h4>,
  // 표는 에디터에서 만들 수 없지만 옛 글에는 있을 수 있다. 좁은 화면에서 레이아웃을
  // 밀어내지 않도록 가로 스크롤 상자에 담는다.
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: Readonly<PostContentProps>) {
  return (
    <div className="post-prose py-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
