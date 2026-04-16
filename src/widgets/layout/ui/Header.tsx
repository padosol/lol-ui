"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/features/theme-toggle";

export default function Header() {

  return (
    <header className="bg-surface-1 border-b border-divider">
      {/* 상단 헤더 */}
      <div className="bg-[#272727] border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[40px] text-sm">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/main_logo.png"
                  alt="METAPICK"
                  width={120}
                  height={28}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
