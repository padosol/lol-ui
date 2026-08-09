import { test, expect, type Page } from "@playwright/test";

/**
 * MP-108 게임 정적 데이터 로딩 회귀 테스트.
 *
 * 챔피언/스펠/아이템/룬 JSON 은 `static.metapick.me/data/{패치}/{로케일}/…` 에서 받아온다.
 * 실제 CDN 에 붙으면 패치가 올라갈 때마다 테스트가 흔들리므로 여기서는 응답을 가로채고
 * "어떤 URL 로 요청했는가" 만 본다.
 */

const CDN_PATTERN = "https://static.metapick.me/data/**";
const DATA_FILE_RE = /\/(summoner|championFull|item|runesReforged)\.json$/;

/** 최신 패치가 목록 첫 번째도, 사전순 최대(16.9)도 아닌 배치 — 숫자 비교로 16.14 가 나와야 한다. */
const SEASONS_RESPONSE = {
  result: "SUCCESS",
  data: [
    { seasonValue: 15, seasonName: "15 시즌", patchVersions: ["15.20", "15.24"] },
    { seasonValue: 16, seasonName: "16 시즌", patchVersions: ["16.14", "16.9", "16.13"] },
  ],
  errorMessage: null,
};

const EXPECTED_LATEST_PATCH = "16.14";

async function stubGameData(page: Page): Promise<string[]> {
  const requestedUrls: string[] = [];

  await page.route("**/v1/seasons", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(SEASONS_RESPONSE),
    })
  );

  await page.route(CDN_PATTERN, (route) => {
    const url = route.request().url();
    const body = url.endsWith("runesReforged.json")
      ? JSON.stringify([])
      : JSON.stringify({ data: {} });
    return route.fulfill({ status: 200, contentType: "application/json", body });
  });

  page.on("request", (request) => {
    if (DATA_FILE_RE.test(new URL(request.url()).pathname)) {
      requestedUrls.push(request.url());
    }
  });

  return requestedUrls;
}

function dataUrlsFor(urls: string[], locale: string): string[] {
  return urls.filter((url) => url.includes(`/${EXPECTED_LATEST_PATCH}/${locale}/`));
}

test.describe("게임 정적 데이터", () => {
  test("최신 패치와 현재 언어 경로로 요청한다", async ({ page }) => {
    const urls = await stubGameData(page);

    await page.goto("/ko");
    await expect
      .poll(() => dataUrlsFor(urls, "ko_KR").length, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(4);

    const koUrls = dataUrlsFor(urls, "ko_KR");
    for (const file of ["championFull", "summoner", "item", "runesReforged"]) {
      expect(
        koUrls.some((url) => url.endsWith(`/${file}.json`)),
        `${file}.json 요청이 있어야 한다`
      ).toBe(true);
    }
    // 패치 목록 순서·사전순이 아니라 숫자 비교로 최신을 골랐는지
    expect(koUrls.every((url) => url.includes(`/data/${EXPECTED_LATEST_PATCH}/`))).toBe(true);
  });

  test("영어 페이지는 en_US 데이터를 받는다", async ({ page }) => {
    const urls = await stubGameData(page);

    await page.goto("/en");
    await expect
      .poll(() => dataUrlsFor(urls, "en_US").length, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(4);

    expect(dataUrlsFor(urls, "ko_KR")).toHaveLength(0);
  });

  test("언어 스위처로 바꾸면 해당 언어 데이터를 다시 받는다", async ({ page }) => {
    const urls = await stubGameData(page);

    await page.goto("/ko");
    await expect
      .poll(() => dataUrlsFor(urls, "ko_KR").length, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(4);

    await page.getByRole("button", { name: /언어|language/i }).first().click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en(\/|$)/);
    await expect
      .poll(() => dataUrlsFor(urls, "en_US").length, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(4);
  });

  test("시즌 정보를 받지 못하면 번들된 데이터로 떨어진다", async ({ page }) => {
    const requestedPaths: string[] = [];

    await page.route("**/v1/seasons", (route) => route.abort());
    page.on("request", (request) => {
      const { pathname } = new URL(request.url());
      if (DATA_FILE_RE.test(pathname)) requestedPaths.push(pathname);
    });

    await page.goto("/ko");
    await expect
      .poll(() => requestedPaths.length, { timeout: 15_000 })
      .toBeGreaterThanOrEqual(4);

    // 패치를 모르면 CDN 대신 public/data 를 쓴다
    expect(requestedPaths.every((path) => path.startsWith("/data/"))).toBe(true);
  });
});
