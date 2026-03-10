import { QueryProvider } from "@/shared/providers/QueryProvider";
import GameDataLoader from "./GameDataLoader";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "롤, 전적 검색, 메타픽, 라이엇 | METAPICK.ME",
  description: "Search Riot ID and Tagline for Stats",
  verification: {
    google: "xR-MUvBKROkou2kxGMHdh3JQmgSMyL20SnZLWf0VMk8",
  },
  other: {
    "google-adsense-account": "ca-pub-1999181347503274",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <GameDataLoader />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
