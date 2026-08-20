/**
 * 본문에 넣을 이미지 마크다운.
 *
 * alt 를 비워 두는 건 게으름이 아니다 — 서버가 원본 파일명을 버리므로(경로 조작·정보 노출
 * 차단) 우리가 아는 설명이 없고, 지어낸 alt 는 스크린리더에 잘못된 정보를 준다.
 * 캡션 입력을 받게 되면 그 값을 여기 채우면 된다.
 */
export function imageMarkdown(url: string): string {
  return `![](${url})`;
}

/**
 * 첨부 목록에서 뺀 이미지를 본문에서도 지운다.
 *
 * 이걸 하지 않으면 본문에는 URL 이 남고 목록에는 없는 상태가 되는데, 그 이미지는 글에
 * 붙지 않아 유예기간 뒤 파일이 사라진다 — 사용자에게는 <b>멀쩡히 저장한 글이 며칠 뒤
 * 깨지는</b> 것으로 보인다.
 */
export function stripImageMarkdown(content: string, url: string): string {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`!\\[[^\\]]*\\]\\(\\s*${escaped}\\s*\\)`, "g");
  return content
    .replace(pattern, "")
    // 이미지만 있던 줄이 사라지며 생긴 빈 줄 더미를 정리한다.
    .replace(/\n{3,}/g, "\n\n");
}
