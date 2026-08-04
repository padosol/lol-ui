import type { Metadata } from "next";
import { TermsOfServicePageClient } from "@/views/terms-of-service";

export const metadata: Metadata = {
  title: "이용약관 | METAPICK.ME",
};

export default function TermsOfServicePage() {
  return <TermsOfServicePageClient />;
}
