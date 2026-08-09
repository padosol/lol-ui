"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";

/** 약관/방침 본문 한 항목. `term` 이 있으면 앞머리를 강조해서 렌더한다. */
export interface LegalListItem {
  term?: string;
  text: string;
  sub?: string[];
}

/** 약관/방침의 한 절. body → subheadings → list 순서로 렌더한다. */
export interface LegalSection {
  heading: string;
  body?: string[];
  listType?: "bullet" | "number";
  list?: LegalListItem[];
  /** 소제목이 여러 개인 절(예: 수집 항목 가/나/다) */
  groups?: { heading: string; items: string[] }[];
  /** 본문 뒤에 붙는 마무리 문단 */
  footer?: string[];
  /** 외부 링크 (문의 폼 등) */
  link?: { label: string; href: string };
}

interface LegalDocumentProps {
  /** messages 의 legal.<namespace> */
  namespace: "terms" | "privacy";
}

export default function LegalDocument({ namespace }: LegalDocumentProps) {
  const t = useTranslations(`legal.${namespace}`);
  const tLegal = useTranslations("legal");
  const sections = t.raw("sections") as LegalSection[];

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl bg-surface-1 rounded-2xl border border-divider p-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-on-surface-disabled mb-8">
          {t("effectiveDate")}
        </p>

        <div className="space-y-8 text-sm text-on-surface-medium leading-relaxed">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-lg font-semibold text-on-surface mb-3">
                {section.heading}
              </h2>

              {section.body?.map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-2" : undefined}>
                  {paragraph}
                </p>
              ))}

              {section.groups?.map((group, i) => (
                <div key={i}>
                  <h3 className="font-medium text-on-surface mb-1">
                    {group.heading}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    {group.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.list && (
                <ul
                  className={`${
                    section.listType === "number"
                      ? "list-decimal"
                      : "list-disc"
                  } pl-5 space-y-1 ${section.body ? "mt-2" : ""}`}
                >
                  {section.list.map((item, i) => (
                    <li key={i}>
                      {item.term && (
                        <span className="font-medium text-on-surface">
                          {item.term}
                        </span>
                      )}
                      {item.term ? " " : null}
                      {item.text}
                      {item.sub && (
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {item.sub.map((sub, j) => (
                            <li key={j}>{sub}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {section.footer?.map((paragraph, i) => (
                <p key={i} className="mt-2">
                  {paragraph}
                </p>
              ))}

              {section.link && (
                <p className="mt-2">
                  <a
                    href={section.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                  >
                    {section.link.label}
                  </a>
                </p>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-on-surface-medium hover:text-on-surface transition-colors"
        >
          {tLegal("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
