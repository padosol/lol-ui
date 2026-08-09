import { z } from "zod";
import { POST_CATEGORIES } from "@/entities/community";

/** messages 의 community.editor.validation.* 키를 받는 번역 함수 */
type TranslateValidation = (
  key:
    | "titleRequired"
    | "titleTooLong"
    | "contentRequired"
    | "categoryRequired"
) => string;

export function createPostEditorSchema(t: TranslateValidation) {
  return z.object({
    title: z
      .string()
      .min(1, t("titleRequired"))
      .max(300, t("titleTooLong")),
    content: z.string().min(1, t("contentRequired")),
    category: z.enum(POST_CATEGORIES, { message: t("categoryRequired") }),
  });
}

export type PostEditorFormData = z.output<
  ReturnType<typeof createPostEditorSchema>
>;
