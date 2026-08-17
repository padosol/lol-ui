import { test, expect } from "@playwright/test";

/**
 * MP-107 로케일 라우팅/번역 회귀 테스트.
 *
 * 여기서는 UI 크롬(내비게이션·섹션 제목·언어 스위처)만 검증한다.
 * 게임 데이터(챔피언·아이템·룬 이름)의 언어별 로딩은 game-data.spec.ts 담당(MP-108).
 */

const KO_HOME_HEADING = "이번 주 무료 챔피언";
const EN_HOME_HEADING = "Free Champion Rotation";

test.describe("로케일 라우팅", () => {
  // localeDetection 이 켜져 있어 prefix 없는 경로는 Accept-Language 를 따른다.
  // 실행 환경의 브라우저 언어에 좌우되지 않도록 각 케이스에서 명시한다.
  test.describe("브라우저 언어가 한국어", () => {
    test.use({ locale: "ko-KR" });

    test("prefix 없는 경로는 ko 로 리다이렉트된다", async ({ page }) => {
      const response = await page.goto("/champion-stats");
      expect(response?.url()).toContain("/ko/champion-stats");
    });
  });

  test.describe("브라우저 언어가 영어", () => {
    test.use({ locale: "en-US" });

    test("prefix 없는 경로는 en 으로 리다이렉트된다", async ({ page }) => {
      const response = await page.goto("/champion-stats");
      expect(response?.url()).toContain("/en/champion-stats");
    });
  });

  test.describe("지원하지 않는 브라우저 언어", () => {
    test.use({ locale: "fr-FR" });

    test("기본 로케일(ko) 로 리다이렉트된다", async ({ page }) => {
      const response = await page.goto("/champion-stats");
      expect(response?.url()).toContain("/ko/champion-stats");
    });
  });

  test("지원하지 않는 로케일은 404 를 준다", async ({ page }) => {
    const response = await page.goto("/fr");
    expect(response?.status()).toBe(404);
  });

  test("html lang 속성이 로케일을 따라간다", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("번역 적용", () => {
  test("홈 섹션 제목이 로케일별로 다르게 나온다", async ({ page }) => {
    await page.goto("/ko");
    await expect(
      page.getByRole("heading", { name: KO_HOME_HEADING })
    ).toBeVisible();

    await page.goto("/en");
    await expect(
      page.getByRole("heading", { name: EN_HOME_HEADING })
    ).toBeVisible();
  });

  test("랭킹 필터 라벨이 로케일별로 번역된다", async ({ page }) => {
    await page.goto("/ko/leaderboards");
    await expect(page.getByText("랭킹 타입", { exact: true })).toBeVisible();

    await page.goto("/en/leaderboards");
    await expect(page.getByText("Queue", { exact: true })).toBeVisible();
  });

  test("이용약관 본문이 로케일별로 번역된다", async ({ page }) => {
    await page.goto("/ko/terms-of-service");
    await expect(page.getByRole("heading", { name: "이용약관" })).toBeVisible();

    await page.goto("/en/terms-of-service");
    await expect(
      page.getByRole("heading", { name: "Terms of Service" })
    ).toBeVisible();
  });

  test("번역 키가 그대로 노출되지 않는다", async ({ page }) => {
    for (const path of ["/ko", "/en", "/ko/leaderboards", "/en/leaderboards"]) {
      await page.goto(path);
      const body = await page.locator("body").innerText();
      // 누락된 키는 next-intl 이 "namespace.key" 형태로 그대로 뱉는다.
      expect(body).not.toMatch(/\b(common|nav|domain|match|duo)\.[a-zA-Z.]+\b/);
    }
  });
});

test.describe("언어 스위처", () => {
  // "언어 선택" 버튼 라벨을 한국어로 고정하기 위해 ko 로 시작한다.
  test.use({ locale: "ko-KR" });

  test("언어를 바꾸면 경로 prefix 와 화면 언어가 함께 바뀐다", async ({
    page,
  }) => {
    await page.goto("/ko");
    await page.getByRole("button", { name: "언어 선택" }).click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(
      page.getByRole("heading", { name: EN_HOME_HEADING })
    ).toBeVisible();
  });

  test("선택한 언어가 새로고침 후에도 유지된다", async ({ page, context }) => {
    await page.goto("/ko");
    await page.getByRole("button", { name: "언어 선택" }).click();
    await page.getByRole("option", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);

    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(localeCookie?.value).toBe("en");
  });
});

test.describe("SEO", () => {
  test("canonical 과 hreflang 이 로케일별로 붙는다", async ({ page }) => {
    await page.goto("/en/leaderboards");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://metapick.me/en/leaderboards"
    );

    const alternates = page.locator('link[rel="alternate"]');
    await expect(alternates).toHaveCount(3);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]')
    ).toHaveAttribute("href", "https://metapick.me/ko/leaderboards");
  });

  test("title 이 로케일별로 번역된다", async ({ page }) => {
    await page.goto("/ko/leaderboards");
    await expect(page).toHaveTitle(/랭킹/);

    await page.goto("/en/leaderboards");
    await expect(page).toHaveTitle(/Leaderboards/);
  });
});
