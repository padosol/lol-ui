import { QueryProvider } from "@/shared/providers/QueryProvider";
import GameDataLoader from "./GameDataLoader";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { Toaster } from "@/shared/ui/toast";
import { routing } from "@/shared/i18n/routing";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "롤 전적 검색, 메타픽, 라이엇 | METAPICK.ME",
  description: "롤 전적 검색, 메타픽을 사용하여 나의 최근 전적을 확인하고, 챔피언 분석을 통해 챔피언 빌드를 최적화하세요!",
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "xR-MUvBKROkou2kxGMHdh3JQmgSMyL20SnZLWf0VMk8",
  },
  other: {
    "google-adsense-account": "ca-pub-1999181347503274",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 정적 렌더링을 위해 요청 로케일을 고정한다
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider>
              <GameDataLoader />
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
