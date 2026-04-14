import { z } from "zod";
import { LANES } from "@/entities/duo";

export const duoRequestSchema = z.object({
  primaryLane: z.enum(LANES, {
    message: "주 라인을 선택해주세요",
  }),
  secondaryLane: z.enum(LANES, {
    message: "부 라인을 선택해주세요",
  }),
  hasMicrophone: z.boolean(),
  memo: z.string().max(500, "메모는 500자 이내로 입력해주세요"),
});

export type DuoRequestFormData = z.output<typeof duoRequestSchema>;
