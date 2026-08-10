interface AuthorAvatarProps {
  nickname: string;
  size?: "sm" | "md";
  /** 본인(로그인 사용자) 표시용 — 강조 색상으로 렌더 */
  highlight?: boolean;
}

/**
 * 닉네임 첫 글자를 딴 사각형 아바타.
 * 프로필 이미지는 외부 호스트가 제각각이라 아직 신뢰할 수 없어 이니셜만 쓴다.
 */
export default function AuthorAvatar({
  nickname,
  size = "md",
  highlight = false,
}: AuthorAvatarProps) {
  const initial = nickname.trim().charAt(0) || "?";
  const sizeClass =
    size === "sm" ? "w-6 h-6 rounded-md text-[11px]" : "w-8 h-8 rounded-lg text-[13px]";

  return (
    <span
      aria-hidden
      className={`${sizeClass} grid shrink-0 place-items-center font-bold ${
        highlight ? "bg-primary text-surface" : "bg-surface-8 text-primary"
      }`}
    >
      {initial}
    </span>
  );
}
