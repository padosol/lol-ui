import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig 의 paths("@/*")를 vite 는 읽지 않는다. 없으면 @/ 를 import 하는 모듈은 테스트할 수 없다.
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Tiptap 은 DOM 없이는 에디터를 만들지 못한다.
    environment: "jsdom",
    // 기본 include 는 tests/ 의 Playwright 스펙(*.spec.ts)까지 집어삼킨다.
    // 단위 테스트는 소스 옆에 *.test.ts 로만 둔다.
    include: ["src/**/*.test.ts"],
  },
});
