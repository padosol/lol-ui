import { z } from "zod";

export const duoRegisterSchema = z.object({
  summonerName: z.string().min(1, "소환사명을 입력해주세요"),
  tagLine: z.string().min(1, "태그를 입력해주세요"),
  tier: z.string().min(1, "티어를 선택해주세요"),
  rank: z.string().min(1, "랭크를 선택해주세요"),
  gameType: z.enum(["SOLO_RANK", "FLEX_RANK", "NORMAL", "ARAM"], {
    message: "게임 종류를 선택해주세요",
  }),
  position: z.enum(["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"], {
    message: "포지션을 선택해주세요",
  }),
  champions: z.array(z.string()).max(3, "챔피언은 최대 3개까지 선택 가능합니다"),
  memo: z.string().max(100, "메모는 100자 이내로 입력해주세요"),
});

export type DuoRegisterFormData = z.output<typeof duoRegisterSchema>;
