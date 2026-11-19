# 커뮤니티 글쓰기 X 게시물 임베드 — 설계

- 날짜: 2026-11-19
- 브랜치: `feature/MP-XXX-x-post-embed` (base: `develop`)
- 상태: 초안

## 1. 왜 만드는가

커뮤니티에서 **롤 패치 소식과 프로씬 소식**을 공유할 때, 출처는 대개 X 게시물이다
(라이엇 개발자 계정, 리그·팀 공식 계정, 기자 등). 지금은 링크만 붙고, 독자가
X 로 넘어가야 내용을 볼 수 있다. 이런 게시물은 **이미지·영상이 핵심**인 경우가
많다(패치 미리보기, 신규 스킨 영상, 경기 하이라이트). 그래서 본문 안에서 원본
그대로 보이는 것이 가치의 대부분이다.

## 2. 목표 / 비목표 / 반목표

### 목표
- 글쓰기·수정 에디터에 X 게시물 주소를 붙여넣으면 그 자리가 **게시물 카드**로 바뀐다.
- 글 상세 화면에서도 같은 카드가 보인다. 에디터에서 본 것과 상세 화면이 같아야 한다(WYSIWYG).
- 카드에서 영상 재생과 인용 게시물 표시가 X 원본대로 동작한다.
- 카드를 불러오지 못하면(광고 차단기, 삭제·비공개 게시물, 스크립트 실패) **일반 링크로 보인다**.

### 비목표 (이번에 안 한다)
- X 프로필·타임라인·리스트 임베드. 단일 게시물만 다룬다.
- 다른 플랫폼(유튜브, 트위치 등) 임베드. 구조는 재사용할 수 있지만 이번 범위 밖이다.
- 툴바 버튼이나 "URL 입력 창". 링크 버튼을 뺀 기존 판단(`EditorToolbar.tsx` 주석)과 같은 이유로, 붙여넣기만으로 충분하다.
- 목록 화면(PostRow/PostCard)에 "X 게시물 포함" 아이콘 붙이기.
- 한 글에 넣을 수 있는 카드 수 제한.
- 듀오 게시판. `DuoPostDetailModal` 은 같은 이름의 **자체** 로컬 컴포넌트를 쓰므로 이번 변경의 영향을 받지 않는다.

### 반목표 (기술적으로 돌아가도 이러면 실패다)
- **본문에 원시 HTML/iframe 을 저장하는 것.** 에디터 `html: false`, 뷰어 `rehype-raw` 미사용으로 막아 둔 방어선이 무너진다.
- **카드가 실패했을 때 링크조차 안 보이는 것.** 작성자가 넣은 출처가 독자에게서 사라진다.
- **수정 화면에서 본문을 건드리지 않았는데 저장할 때 본문이 바뀌는 것.** `usePostEditor` 의 단방향 원칙(본문을 안 만지면 onChange 가 불리지 않아 원문이 그대로 저장된다)을 깨면 안 된다.
- 카드가 늦게 뜨면서 읽던 본문이 크게 밀리는 것.

## 3. 제약 (지금 코드가 정한 것)

- **저장 포맷은 마크다운 문자열**이다. 확장 목록이 곧 저장 포맷의 정의다
  (`features/community-post-editor/model/postEditorExtensions.ts`). 왕복 테스트가
  `postEditorExtensions.test.ts` 에 있다.
- 에디터: Tiptap 3.30.3 + `tiptap-markdown` 0.9.0 (`html: false`, `breaks: true`,
  `linkify: true`). `StarterKit` 의 Link 는 `autolink`, `linkOnPaste` 가 켜져 있다.
- 뷰어: `entities/community/ui/PostContent.tsx`. react-markdown + remark-gfm +
  remark-breaks 를 쓰고 rehype-raw 는 없다. `"use client"` 이지만 서버 페이지에서
  렌더되므로 SSR HTML 에도 나간다.
- 타이포그래피는 뷰어와 에디터가 공유한다(`shared/styles/postProse.css`, `.post-prose`).
- FSD 의존 방향: `entities`·`shared` 는 `features` 를 import 할 수 없다. 테마 상태
  (`useThemeStore`)는 `features/theme-toggle` 에 있다. 적용 결과는 `<html>` 의
  `dark`/`light` 클래스로 나타난다(`shared/providers/ThemeProvider.tsx`). 테마와 무관하게
  항상 어두운 하위 트리는 `.theme-dark` 클래스를 쓴다(`globals.css`).
- 로케일은 next-intl(`ko`, `en`).
- CSP 헤더가 없다. 그래서 `platform.twitter.com` 스크립트와 iframe 이 막히지 않는다. 나중에 CSP 를 도입하면 `script-src`/`frame-src` 에 이 도메인을 넣어야 한다.
- 서버(별도 리포)는 본문을 문자열로 저장한다. `hasImage` 등 서버 판단은 이미지 문법만 본다고 가정한다. 이번 변경에는 **백엔드 작업이 없다**.

## 4. 접근 방식

| | 방식 | 장점 | 단점 | 결론 |
|---|---|---|---|---|
| 1 | **X 공식 임베드** (`platform.twitter.com/widgets.js` 의 `twttr.widgets.createTweet`) | 공식 지원 경로. 영상 재생·인용 게시물까지 원본 그대로. 의존성 추가 없음 | 외부 스크립트 + iframe 이라 늦게 뜨고 높이가 나중에 잡힘. 광고 차단기에 막힐 수 있음. 테마 전환 시 다시 그려야 함 | **채택** |
| 2 | `react-tweet` 3.3.1 (Vercel) | iframe 없이 React 로 그려 빠르고 사이트 테마를 따름 | X 의 비공식 syndication 엔드포인트에 의존해 예고 없이 깨질 수 있음. Next 프록시 라우트 필요 | 기각 |
| – | oEmbed HTML 을 본문에 저장 | 렌더가 단순 | 반목표 1(원시 HTML 저장) 위반 | 기각 |
| – | 직접 메타데이터를 긁어 자체 카드 | 디자인 자유 | X 가 메타데이터를 안정적으로 내주지 않음. 사실상 2번을 손으로 다시 만드는 일 | 기각 |

**1번을 고른 이유:** 공유 대상(패치·프로씬 소식)은 영상이 핵심인 경우가 많다. 또
몇 달 뒤 옛 글에서도 카드가 떠야 한다. 이 두 조건에서 공식 경로가 가장 덜 깨진다.
1번의 약점(느림, 차단)은 "실패하면 링크"와 "지연 로드"로 완화한다.

## 5. 설계

### 5.1 저장 포맷 — URL 한 줄

X 게시물은 본문에 **그 URL 하나만 든 문단**으로 저장한다.

```markdown
패치 노트 요약입니다.

https://x.com/LoLDev/status/1234567890123456789

위 영상처럼 ...
```

- 에디터가 **새로 넣는** URL 은 **표준형** `https://x.com/<handle>/status/<id>` 으로 정규화한다. 기존 본문의 URL 은 건드리지 않는다(5.5).
  `?s=20&t=...` 같은 추적 쿼리, `/photo/1`·`/video/1` 같은 꼬리, `twitter.com`·`mobile.`·`www.` 는 이때 모두 떨어진다.
- 이 포맷은 카드를 그릴 줄 모르는 곳(검색 미리보기, 다른 클라이언트, JS 꺼진 브라우저)에서도 그냥 링크로 읽힌다.
- 기존 글에 이미 단독 줄로 들어 있던 X 링크도 같은 규칙으로 카드가 된다. 이것은 **의도한 동작**이다.

### 5.2 인식 규칙 — 한 곳에 하나

뷰어와 에디터가 **같은 함수**로 판단한다. 두 곳이 달리 판단하면 WYSIWYG 이 깨진다.
`shared` 에 둔다. 이름과 위치는 빌더가 정한다.

- `parseXPostUrl(url) → { id, handle, canonicalUrl } | null`
  - 호스트: `x.com`, `twitter.com` 과 그 `www.`, `mobile.` 변형만 받는다. `x.com.evil.com` 같은 유사 도메인은 거른다.
  - 경로: `/<handle>/status/<id>` (꼬리 `/photo/N`, `/video/N` 허용), `/i/web/status/<id>`, `/i/status/<id>`.
  - `id` 는 숫자만 받는다. 프로필, 검색, 해시태그 URL 은 `null` 이다.
  - `handle` 을 알 수 없는 `/i/...` 형태는 표준형을 `https://x.com/i/status/<id>` 로 만든다.
- **문단 판정:** 다음을 모두 만족하면 카드다. 앞뒤 공백·`<br>` 하나 정도의 차이는 허용 범위를 빌더가 정한다.
  - 문서 **최상위** 문단이다.
  - 그 문단의 유일한 자식이 링크다.
  - 링크 텍스트가 href 와 같다(맨 URL).
  - href 가 `parseXPostUrl` 을 통과한다.
  - `[출처](https://x.com/...)` 처럼 **텍스트를 단 링크**와 **문장 속 링크**는 카드로 바꾸지 않는다. 작성자가 링크로 쓰겠다는 뜻으로 본다.
  - **최상위만 보는 이유 (내 판단):** StarterKit 의 listItem 스키마는 `paragraph block*` 이다. 목록 안 문단을 노드로 바꾸면
    ProseMirror 가 빈 문단을 끼워 넣어 왕복이 깨진다. 인용문까지 허용하면 판정·`updateDOM`·붙여넣기·Enter 가
    전부 부모 정보를 다뤄야 한다. 뉴스 공유라는 목적에 비해 비용이 크다. 그래서 인용문·목록 안의 X 링크는 링크로 남는다.
  - 뷰어에서 `components.p` 만 덮으면 hast 노드에 부모 정보가 없어 인용·목록 안 문단까지 걸린다.
    최상위 판정은 작은 rehype 플러그인으로 하든, 루트 children 을 직접 보든 빌더가 정한다.

### 5.3 공통 카드 컴포넌트 `XPostEmbed` (shared/ui)

뷰어와 에디터 NodeView 가 같은 컴포넌트를 쓴다. 입력은 URL 하나다.

1. **처음에는 일반 링크를 그린다.** 이 링크가 SSR 결과이자, 실패했을 때 그대로 남는 대체 표시다.
   링크는 `PostContent` 의 `a` 와 같은 `target="_blank" rel="noopener noreferrer nofollow"` 를 쓴다.
2. 카드가 화면 근처에 오면(IntersectionObserver, 여유 거리는 빌더) `widgets.js` 를 불러온다.
   스크립트는 **페이지 전체에서 한 번만** 로드한다(싱글턴 로더, 로드 Promise 공유).
3. `twttr.widgets.createTweet(id, 컨테이너, options)` 를 부른다.
   - `theme`: 카드가 놓인 위치의 실제 테마(5.4)
   - `lang`: 현재 next-intl 로케일
   - `dnt: true` (X 의 개인화·추적 끔)
   - `conversation: "none"` (원글 위 스레드를 펼치지 않음)
   - `align: "center"`
4. **성공**(엘리먼트가 돌아옴)하면 링크를 숨긴다.
   **실패**(`undefined` 가 돌아옴 = 삭제·비공개·없는 게시물, 스크립트 로드 실패·차단)하면 링크를 그대로 둔다.
   실패를 사용자에게 따로 알리지는 않는다. 그냥 링크로 보이면 충분하다.
5. **로딩 중 자리**: 카드가 뜰 때의 밀림을 줄이려고 최소 높이 자리를 잡는다.
   값과 모양은 빌더가 정한다. 실패해서 링크만 남으면 자리를 거둔다.
6. 언마운트할 때 만든 iframe 을 정리한다. 뷰어에서 다른 글로 넘어갈 때, 에디터에서 노드를 지울 때 해당한다.

### 5.4 테마

- 카드는 **놓인 위치에서 실제로 적용되는 테마**를 따른다. 기본은 `<html>` 의 `dark`/`light` 이고, 조상에 `.theme-dark` 가 있으면 dark 다.
- `shared` 는 `features/theme-toggle` 를 import 할 수 없다. 그래서 `<html>` 의 class 변화를 관찰하는 방식(MutationObserver)으로 따른다. **(내 판단. 의존 방향을 지키면서 테마 소스를 하나로 유지하는 방법이다.)**
- 테마가 바뀌면 카드를 지우고 새 테마로 다시 그린다. `widgets.js` 는 만든 뒤에 테마를 바꾸는 API 가 없다.

### 5.5 에디터 — `xPost` 노드

`features/community-post-editor` 에 Tiptap 노드 확장을 하나 더한다(`lib/postHeading.ts` 와 같은 자리).
`createPostEditorExtensions` 목록에 등록한다.

- 스키마: `group: "block"`, `atom: true`, `selectable: true`, `draggable: true`. 속성은 `url` 하나다.
  - 붙여넣기·Enter 로 **새로 넣을 때만** 표준형으로 정규화한다.
  - 기존 본문을 읽어 만든 노드는 **원문 URL 을 그대로** 들고 있다. 그래야 다시 직렬화해도 원문과 같다. **(내 판단)**
- **마크다운 직렬화** (`addStorage().markdown.serialize`): URL 을 한 줄 쓰고 블록을 닫는다.
  결과는 5.1 의 포맷이다. URL 은 이스케이프하지 않는다.
- **마크다운 파싱** (`addStorage().markdown.parse.updateDOM`): markdown-it 이 만든 DOM 에서
  5.2 규칙에 맞는 `<p>` 를 이 노드의 `parseHTML` 태그로 바꾼다. 예를 들면 `<div data-x-post-url="...">` 다.
  `tiptap-markdown` 0.9.0 의 `MarkdownParser.parse` 가 이 훅을 부른다.
- **NodeView**: `ReactNodeViewRenderer` 로 `XPostEmbed` 를 감싸 그린다. 노드가 선택되면 `.post-prose` 톤에 맞는 선택 테두리를 보인다.
  iframe 안을 클릭해도 노드를 선택하거나 지울 수 있어야 한다. 방법은 빌더가 정한다(예: 위에 얇은 오버레이나 손잡이).
- **넣는 경로 2가지**
  1. **붙여넣기**: **선택이 비어 있고**, 붙여넣은 평문 전체가(앞뒤 공백 제외) `parseXPostUrl` 을 통과하면 링크 대신 `xPost` 노드를 넣는다.
     - **선택이 있으면 건드리지 않는다.** Link 의 `linkOnPaste`(Tiptap 3.30.3 `pasteHandler.ts`)가 지금처럼 선택한 글자에 링크를 건다.
       링크 버튼이 없는 에디터에서 `[출처](x url)` 을 만드는 유일한 경로이기 때문이다. **(내 판단)**
     - 선택이 비었을 때 기본 동작은 Link 의 paste rule(`markPasteRule`)이 URL 에 링크 마크를 거는 것이다.
       우리 handlePaste 가 `true` 를 돌려 기본 붙여넣기를 가로채면 paste rule 도 돌지 않는다.
     - 기존 `usePostEditor` 의 `handlePaste`(파일 처리)와 충돌하지 않게 둔다.
     - 빈 문단에서 붙여넣으면 그 문단을 대체한다. 글자가 있는 문단 중간이면 문단을 나눠 그 사이에 넣는다.
     - 목록·인용·제목·코드블록 안에서는 카드로 바꾸지 않는다(5.2 최상위 규칙). 평소대로 링크가 된다.
     - 붙여넣은 직후 Ctrl+Z 를 누르면 붙여넣기 전체가 취소된다(ProseMirror 기본 history). 링크로 되돌리는 중간 단계는 두지 않는다. **(내 판단)**
  2. **Enter**: 현재 **최상위** 문단의 텍스트 전체가 X 게시물 URL 하나뿐일 때 Enter 를 누르면 그 문단을 `xPost` 로 바꾸고 다음 줄로 간다.
     손으로 친 URL 을 위한 경로다.
  - 이 둘 밖의 경우(URL 만 든 문단을 Enter 없이 남긴 채 저장)는 에디터에선 링크로 보이고 상세에선 카드로 보인다.
    다시 수정 화면을 열면 카드로 읽힌다. **(내 판단. 남는 어긋남이 작고, 모든 편집마다 문서를 훑는 비용보다 낫다.)**
- **수정 화면 단방향 원칙과 TrailingNode**
  - StarterKit 이 켠 TrailingNode 는 마지막 블록이 문단이 아니면 다음 트랜잭션에 빈 문단을 덧붙인다(`appendTransaction`).
    클릭·포커스 같은 선택만 바뀐 트랜잭션도 여기에 해당한다.
  - Tiptap 3.30.3 의 `Editor.dispatchTransaction` 은 덧붙은 트랜잭션 중 하나라도 문서를 바꾸면 `update` 를 낸다
    (`transactions.some(tr => tr.docChanged)`).
  - 그래서 **X 카드로 끝나는 글은 수정 화면에서 클릭만 해도 onChange 가 불려** 본문 전체가 다시 직렬화된다.
    "요약 + 카드" 는 흔한 모양이라 이번 기능이 이 경로를 크게 넓힌다.
  - **대응 (내 판단):** `usePostEditor` 의 `onUpdate` 에서 사용자 입력 자체(`transaction.docChanged`)가 문서를 바꾸지 않았으면 onChange 를 부르지 않는다.
    덧붙은 트랜잭션만 문서를 바꾼 경우가 걸러진다.
  - 이 수정은 목록·인용·코드블록·구분선으로 끝나는 **기존 글**에도 적용된다. 지금도 같은 문제가 있으므로 원칙을 원래 의도대로 되돌리는 것이다.
  - 원문 URL 보존(위 스키마)과 함께 테스트로 고정한다.
- 이미지 첨부 바(`useDocumentImageUrls`)는 이미지 노드만 센다. 이 노드는 영향을 주지 않는다.
- 글자 수 카운터는 이 노드를 0자로 센다. 그대로 둔다.

### 5.6 뷰어 — `PostContent`

`components.p` 를 덮어, 5.2 문단 판정을 통과하면 `<p>` 대신 `XPostEmbed` 를 그린다.
나머지 문단은 지금과 같다. 판정에는 react-markdown 이 넘기는 hast `node` 를 쓴다.

### 5.7 스타일

카드 둘레의 여백과 가로 정렬, 로딩 자리, 에디터 선택 테두리는 `postProse.css` 에 둔다.
뷰어와 에디터가 같은 규칙을 써야 하기 때문이다.

## 6. 테스트

- **단위 (`parseXPostUrl`)**: `x.com`, `twitter.com`, `mobile.`, `www.`, `/i/web/status`,
  추적 쿼리, `/photo/1` 꼬리를 받는지, 표준형이 맞는지 본다. 거부해야 할 것도 본다:
  프로필, 검색, status 없는 경로, 숫자 아닌 id, `x.com.evil.com`, `notx.com`, `http:` 가 아닌 스킴.
- **마크다운 왕복 (`postEditorExtensions.test.ts` 에 추가)**
  - 표준형 URL 한 줄은 그대로 돌아온다. 앞뒤 문단이 함께 있어도 마찬가지다.
  - 쿼리 붙은 URL 을 읽으면 `xPost` 노드가 되고, **원문 그대로** 직렬화된다.
  - 문장 속 X 링크, `[텍스트](x url)` 링크, 인용문·목록 안의 X 링크는 링크로 남는다.
  - X 게시물만 있는 글이 "빈 글"(`toMarkdown` 이 `""`)로 처리되지 않는다.
  - 이미지와 X 게시물이 섞인 글도 왕복된다.
- **에디터 동작**
  - 빈 선택에서 X URL 을 붙여넣으면 노드가 생기고, 표준형으로 정규화된다.
  - 글자를 선택하고 X URL 을 붙여넣으면 선택한 글자에 링크가 걸린다.
  - URL 만 친 최상위 문단에서 Enter 를 누르면 노드로 바뀐다.
  - X 카드로 끝나는 글을 열고 클릭·포커스만 하면 onChange 가 불리지 않는다.
- **뷰어**: 같은 마크다운을 `PostContent` 구성으로 렌더하면 단독 URL 은 카드 자리(대체 링크 포함)로, 문장 속 링크는 일반 링크로 나온다.
- **카드 동작**: `widgets.js` 로드 실패나 `createTweet` 의 `undefined` 에서 링크가 남는다. 성공하면 링크가 숨는다.
  `twttr` 를 가짜로 바꾼 단위 테스트로 할지, Playwright 에서 `platform.twitter.com` 을 route 로 막아 볼지는 빌더가 정한다.
- **실제 확인**: 개발 서버에서 실제 X 게시물(영상 포함 1건, 인용 1건)을 붙여넣어 에디터와 상세 화면에서 카드가 뜨는지, 테마 전환에 따라오는지 눈으로 본다.

## 7. 빌더에게 맡기는 것

- 파일·함수 이름과 정확한 위치(위에 적은 레이어 안에서)
- 지연 로드 여유 거리, 로딩 자리 높이와 모양
- 문단 판정에서 허용할 공백·줄바꿈의 범위
- 에디터에서 iframe 위 클릭을 노드 선택으로 받는 방법
- 붙여넣기 처리를 노드 확장 안 플러그인으로 둘지, `usePostEditor` 의 `handlePaste` 에 합칠지
- `widgets.js` 타입 선언(`window.twttr`)을 어디에 둘지

## 8. 범위 밖이지만 알아 둘 것

- X 임베드는 독자 브라우저가 X 서버에 직접 요청하게 만든다. `dnt: true` 로 추적은 줄이지만 제3자 요청 자체는 남는다.
  개인정보처리방침에 이 내용을 적을지는 이번 작업과 별개로 판단할 일이다.
- 나중에 CSP 를 도입하면 `platform.twitter.com`(script, frame), `syndication.twitter.com`, `cdn.syndication.twimg.com` 등을 허용해야 한다.
