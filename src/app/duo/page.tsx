import type { Metadata } from "next";
import { DuoPageClient } from "@/views/duo";

export const metadata: Metadata = {
  title: "듀오 찾기 | METAPICK.ME",
  description: "리그 오브 레전드 듀오 파트너를 찾아보세요. 솔로랭크, 자유랭크, 일반게임, 칼바람 듀오를 구할 수 있습니다.",
};

export default function DuoPage() {
  return <DuoPageClient />;
}
