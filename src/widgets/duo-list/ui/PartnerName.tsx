interface PartnerNameProps {
  gameName: string;
  tagLine: string | null;
}

/** 매칭 파트너 게임명#태그라인 표시. tagLine 이 null 이면 '#' 없이 게임명만 렌더. */
export default function PartnerName({ gameName, tagLine }: PartnerNameProps) {
  return (
    <span className="text-primary font-medium">
      {gameName}
      {tagLine && (
        <span className="text-on-surface-disabled">#{tagLine}</span>
      )}
    </span>
  );
}
