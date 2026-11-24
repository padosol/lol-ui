import { describe, expect, it } from "vitest";
import { isDisbanded } from "./teams";

describe("isDisbanded", () => {
  const today = "2026-11-25";

  it("해체일이 오늘이거나 지났으면 해체된 팀이다", () => {
    expect(isDisbanded({ disbandedAt: "2026-11-25" }, today)).toBe(true);
    expect(isDisbanded({ disbandedAt: "2024-12-31" }, today)).toBe(true);
  });

  it("해체일이 없거나 아직 오지 않았으면 운영 중이다", () => {
    expect(isDisbanded({ disbandedAt: null }, today)).toBe(false);
    expect(isDisbanded({ disbandedAt: "2026-12-31" }, today)).toBe(false);
  });
});
