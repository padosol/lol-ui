import type { Metadata } from "next";
import { MypageClient } from "@/views/mypage";

export const metadata: Metadata = {
  title: "마이페이지 | METAPICK.ME",
  description: "계정 관리 및 연결된 앱을 관리할 수 있습니다.",
};

export default function MypagePage() {
  return <MypageClient />;
}
