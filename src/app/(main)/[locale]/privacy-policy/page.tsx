import type { Metadata } from "next";
import { PrivacyPolicyPageClient } from "@/views/privacy-policy";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | METAPICK.ME",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />;
}
