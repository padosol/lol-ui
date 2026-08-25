import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tiptap 은 DOM 없이는 에디터를 만들지 못한다.
    environment: "jsdom",
    // 기본 include 는 tests/ 의 Playwright 스펙(*.spec.ts)까지 집어삼킨다.
    // 단위 테스트는 소스 옆에 *.test.ts 로만 둔다.
    include: ["src/**/*.test.ts"],
  },
});
