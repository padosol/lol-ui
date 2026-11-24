import { describe, expect, it } from "vitest";
import { esportsHomeHref, esportsPersonHref, esportsTeamHref } from "./routes";

describe("esportsHomeHref", () => {
  it("리그를 고르지 않으면 e-sports 첫 화면이다", () => {
    expect(esportsHomeHref()).toBe("/esports");
  });

  it("리그를 고르면 league 쿼리로 넘긴다", () => {
    expect(esportsHomeHref("lck_cl")).toBe("/esports?league=lck_cl");
  });

  it("리그 ID 의 특수 문자를 인코딩한다", () => {
    expect(esportsHomeHref("a b&c")).toBe("/esports?league=a%20b%26c");
  });
});

describe("팀·인물 경로", () => {
  it("팀 ID 와 인물 ID 를 경로에 인코딩해 넣는다", () => {
    expect(esportsTeamHref("alpha_ca")).toBe("/esports/teams/alpha_ca");
    expect(esportsPersonHref("a/b")).toBe("/esports/persons/a%2Fb");
  });
});
