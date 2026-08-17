import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Next.js 네비게이션 API의 로케일 인지 래퍼.
 * 컴포넌트에서는 next/link, next/navigation 대신 이쪽을 쓴다 — 현재 로케일 prefix가 자동으로 붙는다.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
