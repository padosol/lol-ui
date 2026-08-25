import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // 언더스코어로 시작하는 미사용 변수 허용
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // UI 레이어에 한국어 문자열을 직접 박지 못하게 막는다 (MP-107).
  // 표시 문자열은 src/shared/i18n/messages 의 키를 통해서만 들어와야 한다.
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/views/**/*.{ts,tsx}",
      "src/widgets/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/entities/**/*.{ts,tsx}",
    ],
    ignores: [
      // 테스트 문자열은 사용자에게 보이지 않는다. 한국어 본문을 그대로 넣어야
      // 마크다운 왕복 같은 것을 실제 글에 가까운 입력으로 검증할 수 있다.
      "src/**/*.test.{ts,tsx}",
      // 패치노트 원문이 한국어라 접미사만 번역하면 문장이 섞인다 (MP-106 영역).
      "src/entities/patch-note/lib/transformPatchNote.ts",
      // 탭이 비활성화된 목업 컴포넌트. 노출 시점에 함께 번역한다.
      "src/widgets/summoner-profile/ui/FanLetter.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXText[value=/[가-힣]/]",
          message:
            "JSX 안에 한국어를 직접 쓰지 마세요. useTranslations() 로 messages 의 키를 사용하세요.",
        },
        {
          selector: "Literal[value=/[가-힣]/]",
          message:
            "한국어 문자열 리터럴을 쓰지 마세요. useTranslations() 로 messages 의 키를 사용하세요.",
        },
        {
          selector: "TemplateElement[value.raw=/[가-힣]/]",
          message:
            "템플릿 문자열에 한국어를 쓰지 마세요. useTranslations() 로 messages 의 키를 사용하세요.",
        },
      ],
    },
  },
]);

export default eslintConfig;
