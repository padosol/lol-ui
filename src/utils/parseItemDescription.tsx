import type { ReactNode } from "react";

const TAG_STYLES: Record<string, string> = {
  attention: "text-gold font-bold",
  passive: "text-on-surface font-semibold",
  active: "text-on-surface font-semibold",
  physicaldamage: "text-stat-low",
  magicdamage: "text-primary",
  truedamage: "text-warning",
  healing: "text-success",
  shield: "text-on-surface-medium",
  speed: "text-on-surface-medium",
  onhit: "text-on-surface-medium italic",
  status: "text-stat-mid",
  scaleap: "text-primary",
  scalead: "text-stat-low",
  scalelevel: "text-gold",
  scalehealth: "text-success",
  scalemana: "text-stat-mid",
  scalearmor: "text-warning",
  scalemr: "text-primary",
  rules: "text-on-surface-disabled text-xs italic",
  maintext: "",
  stats: "",
  keywordstealth: "text-primary",
  li: "",
  flavortext: "text-on-surface-disabled italic text-xs",
};

const descriptionCache = new Map<string, ReactNode[]>();

function parseNodes(html: string, counter: { current: number }): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor);

    if (tagStart === -1) {
      // Rest is plain text
      const text = html.slice(cursor);
      if (text) nodes.push(text);
      break;
    }

    // Push text before tag
    if (tagStart > cursor) {
      const text = html.slice(cursor, tagStart);
      if (text) nodes.push(text);
    }

    // Check for <br> or <br/>
    const brMatch = html.slice(tagStart).match(/^<br\s*\/?>/i);
    if (brMatch) {
      nodes.push(<br key={`br-${counter.current++}`} />);
      cursor = tagStart + brMatch[0].length;
      continue;
    }

    // Check for closing tag
    if (html[tagStart + 1] === "/") {
      const closeEnd = html.indexOf(">", tagStart);
      cursor = closeEnd === -1 ? html.length : closeEnd + 1;
      continue;
    }

    // Opening tag
    const tagMatch = html.slice(tagStart).match(/^<(\w+)(?:\s[^>]*)?>/i);
    if (!tagMatch) {
      nodes.push("<");
      cursor = tagStart + 1;
      continue;
    }

    const tagName = tagMatch[1].toLowerCase();
    const fullOpenTag = tagMatch[0];
    const contentStart = tagStart + fullOpenTag.length;

    // Find matching closing tag
    const closingTag = `</${tagName}>`;
    const closingIdx = html.toLowerCase().indexOf(closingTag.toLowerCase(), contentStart);

    if (closingIdx === -1) {
      // No closing tag, treat content as remaining
      const innerHtml = html.slice(contentStart);
      const children = parseNodes(innerHtml, counter);
      const className = TAG_STYLES[tagName] || "";
      if (className) {
        nodes.push(
          <span key={`tag-${counter.current++}`} className={className}>
            {children}
          </span>
        );
      } else {
        nodes.push(...children);
      }
      cursor = html.length;
    } else {
      const innerHtml = html.slice(contentStart, closingIdx);
      const children = parseNodes(innerHtml, counter);
      const className = TAG_STYLES[tagName] || "";

      if (tagName === "li") {
        nodes.push(
          <span key={`tag-${counter.current++}`} className="block ml-2">
            {"- "}
            {children}
          </span>
        );
      } else if (className) {
        nodes.push(
          <span key={`tag-${counter.current++}`} className={className}>
            {children}
          </span>
        );
      } else {
        nodes.push(...children);
      }
      cursor = closingIdx + closingTag.length;
    }
  }

  return nodes;
}

export function parseItemDescription(description: string): ReactNode[] {
  if (!description) return [];

  const cached = descriptionCache.get(description);
  if (cached) return cached;

  const result = parseNodes(description, { current: 0 });
  descriptionCache.set(description, result);
  return result;
}
