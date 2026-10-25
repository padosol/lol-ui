/**
 * 서버 `community.image.*` 설정과 값을 맞춰야 한다.
 *
 * 여기서 먼저 거르는 건 왕복 한 번을 아껴 즉시 피드백을 주기 위해서다 —
 * <b>진짜 방어는 서버가 한다.</b> 클라이언트 검증은 우회할 수 있고, 서버는 확장자가 아니라
 * 매직바이트로 실제 타입을 다시 판별한다.
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_IMAGE_SIZE_MB = MAX_IMAGE_SIZE_BYTES / 1024 / 1024;

/** SVG 는 없다. 스크립트를 담을 수 있어 서버가 화이트리스트에서 제외했다. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const MAX_IMAGES_PER_POST = 10;

/** `<input type="file">` 의 accept 값. 어디까지나 파일 선택창 필터일 뿐 검증이 아니다. */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}
