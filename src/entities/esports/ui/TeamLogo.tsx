import type { EsportsTeam } from "../types";

type TeamLogoSize = "sm" | "md" | "lg" | "xl";

const SIZE: Record<TeamLogoSize, string> = {
  sm: "size-7 rounded-md text-[9px]",
  md: "size-9 rounded-md text-[10px]",
  lg: "size-13 rounded-lg text-[13px]",
  xl: "size-16 rounded-lg text-[13px]",
};

interface TeamLogoProps {
  team: Pick<EsportsTeam, "teamCode" | "imageUrl" | "darkImageUrl"> | null | undefined;
  size?: TeamLogoSize;
  className?: string;
}

/**
 * 팀 로고. 로고가 없으면 팀 코드 타일을 그린다.
 * 팀 이름이 항상 옆에 함께 보이므로 장식으로 다룬다(alt 비움).
 */
export default function TeamLogo({ team, size = "md", className = "" }: TeamLogoProps) {
  const src = team?.imageUrl ?? team?.darkImageUrl ?? null;
  const base = `flex shrink-0 items-center justify-center border border-divider bg-surface-2 ${SIZE[size]} ${className}`;

  if (src) {
    return (
      // 로고는 관리자가 넣는 외부 주소라 next/image 허용 호스트에 미리 등록할 수 없다.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" aria-hidden="true" className={`${base} object-contain p-1`} />
    );
  }
  return (
    <span aria-hidden="true" className={`${base} font-bold text-on-surface-medium`}>
      {team?.teamCode ?? ""}
    </span>
  );
}
