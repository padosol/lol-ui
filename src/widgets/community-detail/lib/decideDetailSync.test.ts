import { describe, it, expect } from "vitest";
import type { Post } from "@/entities/community";
import { decideDetailSync } from "./decideDetailSync";

const asMember = { viewerAuthenticated: true };
const asGuest = { viewerAuthenticated: false };
// viewerAuthenticated 가 없는 응답(백엔드 배포 전)은 비로그인으로 본다.
const noField = {} as Pick<Post, "viewerAuthenticated">;

const WAIT = { revalidate: false, recordView: false };
const REVALIDATE = { revalidate: true, recordView: false };
const RECORD = { revalidate: false, recordView: true };

describe("decideDetailSync", () => {
  it.each([
    // 세션이 아직 확정되지 않았다 — 아무것도 하지 않는다.
    ["unknown", asGuest, false, WAIT],
    ["unknown", asMember, false, WAIT],
    ["unknown", undefined, false, WAIT],
    // 글을 아직 받지 못했다 — 받을 때까지 기다린다.
    ["authenticated", undefined, false, WAIT],
    ["authenticated", undefined, true, WAIT],
    ["anonymous", undefined, false, WAIT],
    ["unverified", undefined, false, WAIT],
    // 세션은 로그인인데 서버가 비로그인으로 답했다 — 세션을 다시 확인한 뒤 기록한다.
    ["authenticated", asGuest, false, REVALIDATE],
    ["authenticated", noField, false, REVALIDATE],
    // 이미 다시 확인했다 — 결과와 무관하게 기록을 풀어 준다(재시도 고리 없음).
    ["authenticated", asGuest, true, RECORD],
    ["authenticated", noField, true, RECORD],
    // 세션과 응답이 맞거나 다시 확인할 이유가 없다 — 바로 기록한다.
    ["authenticated", asMember, false, RECORD],
    ["authenticated", asMember, true, RECORD],
    ["anonymous", asGuest, false, RECORD],
    ["anonymous", asMember, false, RECORD],
    ["unverified", asGuest, false, RECORD],
    ["unverified", asMember, false, RECORD],
  ] as const)("%s / %o / attempted=%s → %o", (status, post, attempted, expected) => {
    expect(decideDetailSync(status, post, attempted)).toEqual(expected);
  });
});
