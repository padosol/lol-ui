"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/entities/auth";
import { useRouter } from "@/shared/i18n/navigation";
import { useHasHydrated } from "@/shared/lib/useHasHydrated";
import { resolveAdminAccess } from "../model/adminAccess";
import AdminForbidden from "./AdminForbidden";

/**
 * ADMIN 에게만 children 을 보여준다. 비로그인이면 로그인 화면으로, 일반 회원이면 권한 없음 화면.
 * 메뉴를 숨겨도 주소로 직접 들어올 수 있어 화면에서 한 번 막는다(실제 권한은 서버가 검사한다).
 */
export default function AdminGuard({ children }: Readonly<{ children: ReactNode }>) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const hasHydrated = useHasHydrated(useAuthStore);
  const router = useRouter();
  const access = resolveAdminAccess({ hasHydrated, status, user });

  useEffect(() => {
    if (access === "anonymous") router.replace("/login");
  }, [access, router]);

  if (access === "granted") return <>{children}</>;
  if (access === "forbidden") return <AdminForbidden />;

  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
