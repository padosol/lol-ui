"use client";

import type { ReactElement } from "react";
import ChampionTooltipContent from "./ChampionTooltipContent";
import ItemTooltipContent from "./ItemTooltipContent";
import RuneTooltipContent from "./RuneTooltipContent";
import ChampionSpellTooltipContent from "./ChampionSpellTooltipContent";
import SpellTooltipContent from "./SpellTooltipContent";
import Tooltip from "./Tooltip";

interface GameTooltipProps {
  type: "item" | "champion" | "rune" | "spell" | "championSpell";
  id: number | string;
  disabled?: boolean;
  children: ReactElement;
}

export default function GameTooltip({ type, id, disabled, children }: GameTooltipProps) {
  if (disabled) return children;

  let content;
  switch (type) {
    case "item":
      content = <ItemTooltipContent itemId={typeof id === "number" ? id : parseInt(id, 10)} />;
      break;
    case "champion":
      content = <ChampionTooltipContent championName={String(id)} />;
      break;
    case "rune":
      content = <RuneTooltipContent runeId={typeof id === "number" ? id : parseInt(id, 10)} />;
      break;
    case "spell":
      content = <SpellTooltipContent spellId={typeof id === "number" ? id : parseInt(id, 10)} />;
      break;
    case "championSpell": {
      const [championName, skillIndexStr] = String(id).split(":");
      content = <ChampionSpellTooltipContent championName={championName} skillIndex={parseInt(skillIndexStr, 10)} />;
      break;
    }
  }

  return (
    <Tooltip content={content}>
      {children}
    </Tooltip>
  );
}
