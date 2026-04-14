import type { Metadata } from "next";
import { DuoPageClient } from "@/views/duo";

export const metadata: Metadata = {
  title: "듀오 찾기 | METAPICK.ME",
  description: "리그 오브 레전드 듀오 파트너를 찾아보세요. 매칭 요청을 보내고 파트너를 확정할 수 있습니다.",
};

export default function DuoPage() {
  return <DuoPageClient />;
}
