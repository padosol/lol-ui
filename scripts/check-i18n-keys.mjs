#!/usr/bin/env node
/**
 * 로케일 메시지 파일의 키 집합이 서로 일치하는지 검사한다.
 *
 * 기준 로케일(ko)을 기준으로:
 *  - 다른 로케일에 없는 키 → missing
 *  - 다른 로케일에만 있는 키 → extra
 *  - 값의 타입(문자열/객체/배열)이 다른 키 → mismatch
 *
 * 사용: node scripts/check-i18n-keys.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MESSAGES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "shared",
  "i18n",
  "messages"
);
const BASE_LOCALE = "ko";

/** 중첩 객체를 "a.b.c" 형태의 평평한 키 → 타입 맵으로 만든다. */
function flatten(value, prefix = "", out = new Map()) {
  if (Array.isArray(value)) {
    // 배열은 요소별로 펼치지 않는다. 길이만 비교해도 충분하다.
    out.set(prefix, `array(${value.length})`);
    return out;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }
  out.set(prefix, typeof value);
  return out;
}

function loadLocale(locale) {
  const raw = readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf-8");
  return flatten(JSON.parse(raw));
}

const locales = readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.replace(/\.json$/, ""));

if (!locales.includes(BASE_LOCALE)) {
  console.error(`기준 로케일 ${BASE_LOCALE}.json 이 없습니다.`);
  process.exit(1);
}

const base = loadLocale(BASE_LOCALE);
let failed = false;

for (const locale of locales.filter((l) => l !== BASE_LOCALE)) {
  const target = loadLocale(locale);
  const missing = [...base.keys()].filter((key) => !target.has(key));
  const extra = [...target.keys()].filter((key) => !base.has(key));
  const mismatched = [...base.entries()]
    .filter(([key, type]) => target.has(key) && target.get(key) !== type)
    .map(([key, type]) => `${key} (${BASE_LOCALE}=${type}, ${locale}=${target.get(key)})`);

  if (missing.length || extra.length || mismatched.length) {
    failed = true;
    console.error(`\n[${locale}] 키가 ${BASE_LOCALE} 와 다릅니다.`);
    if (missing.length) {
      console.error(`  누락 ${missing.length}개:`);
      missing.forEach((key) => console.error(`    - ${key}`));
    }
    if (extra.length) {
      console.error(`  초과 ${extra.length}개:`);
      extra.forEach((key) => console.error(`    + ${key}`));
    }
    if (mismatched.length) {
      console.error(`  타입 불일치 ${mismatched.length}개:`);
      mismatched.forEach((key) => console.error(`    ! ${key}`));
    }
  } else {
    console.log(`[${locale}] OK — ${target.size}개 키가 ${BASE_LOCALE} 와 일치합니다.`);
  }
}

if (failed) {
  process.exit(1);
}
