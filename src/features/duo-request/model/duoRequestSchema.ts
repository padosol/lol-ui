import { z } from "zod";
import { LANES } from "@/entities/duo";

/** messages 의 duo.validation.* 키를 받는 번역 함수 */
type TranslateValidation = (
  key: "primaryLaneRequired" | "secondaryLaneRequired" | "memoTooLong"
) => string;

export function createDuoRequestSchema(t: TranslateValidation) {
  return z.object({
    primaryLane: z.enum(LANES, { message: t("primaryLaneRequired") }),
    desiredLane: z.enum(LANES, { message: t("secondaryLaneRequired") }),
    hasMicrophone: z.boolean(),
    memo: z.string().max(500, t("memoTooLong")),
  });
}

export type DuoRequestFormData = z.output<
  ReturnType<typeof createDuoRequestSchema>
>;
