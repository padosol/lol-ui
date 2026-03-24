import { z } from "zod";
import { POST_CATEGORIES } from "@/entities/community";

export const postEditorSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(300, "제목은 최대 300자까지 입력 가능합니다"),
  content: z.string().min(1, "내용을 입력해주세요"),
  category: z.enum(POST_CATEGORIES, { message: "카테고리를 선택해주세요" }),
});

export type PostEditorFormData = z.output<typeof postEditorSchema>;
