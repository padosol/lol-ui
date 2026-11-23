import type { MemberProfile } from "../types";

/** 관리자 메뉴·화면을 열어 줄지. 실제 권한은 서버가 토큰으로 다시 검사한다. */
export function isAdmin(user: MemberProfile | null | undefined): boolean {
  return user?.role === "ADMIN";
}
