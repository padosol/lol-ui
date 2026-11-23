import { describe, it, expect } from "vitest";
import { getChampionSplashUrl } from "./championImage";

describe("getChampionSplashUrl", () => {
  it("Data Dragon 의 기본 스킨 스플래시 주소를 만든다", () => {
    expect(getChampionSplashUrl("Ahri")).toBe(
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg"
    );
  });

  it("이름이 비었으면 빈 문자열", () => {
    expect(getChampionSplashUrl("")).toBe("");
  });
});
