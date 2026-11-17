import { describe, it, expect } from "vitest";
import type { Post } from "@/entities/community";
import { shouldRefetchPersonalization } from "./shouldRefetchPersonalization";

describe("shouldRefetchPersonalization", () => {
  it.each([
    ["authenticated", { viewerAuthenticated: false }, true],
    ["authenticated", { viewerAuthenticated: true }, false],
    ["authenticated", {} as Pick<Post, "viewerAuthenticated">, true],
    ["authenticated", undefined, false],
    ["anonymous", { viewerAuthenticated: false }, false],
    ["unknown", { viewerAuthenticated: false }, false],
    ["unverified", { viewerAuthenticated: false }, false],
  ] as const)("%s / %o → %s", (status, post, expected) => {
    expect(shouldRefetchPersonalization(status, post)).toBe(expected);
  });
});
