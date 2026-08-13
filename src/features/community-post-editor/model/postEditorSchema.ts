import { z } from "zod";

/** messages 의 community.editor.validation.* 키를 받는 번역 함수 */
type TranslateValidation = (
  key:
    | "titleRequired"
    | "titleTooLong"
    | "contentRequired"
    | "categoryRequired"
) => string;

/**
 * 게시판 목록이 DB 로 옮겨가면서 z.enum 을 쓸 수 없게 됐다. 대신 서버가 내려준
 * 쓰기 가능 id 목록을 받아 검증한다 — 컴파일 타임 union 은 잃지만 런타임
 * 검증은 오히려 정확해진다. 숨김·읽기 전용 게시판 선택까지 막게 되기 때문이다.
 *
 * @param writableIds 응답이 오기 전에는 빈 배열이다. 호출부는 그동안 제출을
 *   막아야 한다(그러지 않으면 정상 입력이 "카테고리를 선택하세요" 로 거부된다).
 */
export function createPostEditorSchema(
  t: TranslateValidation,
  writableIds: number[]
) {
  return z.object({
    title: z
      .string()
      .min(1, t("titleRequired"))
      .max(300, t("titleTooLong")),
    content: z.string().min(1, t("contentRequired")),
    // 0 이 곧 "미선택" 이다. 게시판 id 는 1 부터라 값과 겹치지 않고,
    // undefined 와 달리 zod 가 타입 에러 대신 번역된 메시지를 낸다.
    categoryId: z
      .number()
      .refine((value) => writableIds.includes(value), {
        message: t("categoryRequired"),
      }),
  });
}

export type PostEditorFormData = z.output<
  ReturnType<typeof createPostEditorSchema>
>;
