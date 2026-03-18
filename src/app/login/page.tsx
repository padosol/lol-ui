import type { Metadata } from "next";
import { LoginPageClient } from "@/views/login";

export const metadata: Metadata = {
  title: "로그인 | METAPICK.ME",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
