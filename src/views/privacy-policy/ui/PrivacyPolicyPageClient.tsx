"use client";

import Link from "next/link";

const CONTACT_FORM_URL = "https://forms.gle/a5eF1Wapwirawq936";

export default function PrivacyPolicyPageClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl bg-surface-1 rounded-2xl border border-divider p-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          개인정보 처리방침
        </h1>
        <p className="text-sm text-on-surface-disabled mb-8">
          시행일: 2026년 3월 18일
        </p>

        <div className="space-y-8 text-sm text-on-surface-medium leading-relaxed">
          {/* 1. 개인정보의 수집 및 이용 목적 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              METAPICK(이하 &quot;서비스&quot;)은 다음의 목적을 위해 개인정보를
              수집 및 이용합니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>회원 식별 및 로그인 인증</li>
              <li>리그 오브 레전드 전적 검색 서비스 제공</li>
              <li>서비스 이용 통계 분석 및 품질 개선</li>
              <li>부정 이용 방지 및 서비스 안정성 확보</li>
            </ul>
          </section>

          {/* 2. 수집하는 개인정보 항목 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              2. 수집하는 개인정보 항목
            </h2>
            <h3 className="font-medium text-on-surface mb-1">
              가. Google OAuth 로그인 시 수집 항목
            </h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>이메일 주소</li>
              <li>이름(닉네임)</li>
              <li>프로필 사진 URL</li>
            </ul>
            <h3 className="font-medium text-on-surface mb-1">
              나. 서비스 이용 시 자동 수집 항목
            </h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>쿠키(Cookie)</li>
              <li>IP 주소</li>
              <li>접속 일시</li>
              <li>브라우저 종류 및 버전</li>
            </ul>
            <h3 className="font-medium text-on-surface mb-1">
              다. 사용자 입력 정보
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                리그 오브 레전드 소환사명 및 태그 (사용자가 직접 연동한 경우)
              </li>
            </ul>
          </section>

          {/* 3. 개인정보의 보유 및 이용 기간 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회원 탈퇴 시 또는 수집 목적 달성 시 지체 없이 파기합니다. 단,
              관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>로그인 기록: 회원 탈퇴 시까지</li>
              <li>접속 로그: 3개월</li>
            </ul>
          </section>

          {/* 4. 개인정보의 제3자 제공 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만,
              법령에 의해 요구되는 경우는 예외로 합니다.
            </p>
          </section>

          {/* 5. 개인정보의 파기 절차 및 방법 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              5. 개인정보의 파기 절차 및 방법
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium text-on-surface">파기 절차:</span>{" "}
                보유 기간 만료 또는 회원 탈퇴 시 지체 없이 파기합니다.
              </li>
              <li>
                <span className="font-medium text-on-surface">파기 방법:</span>{" "}
                전자적 파일은 복구 불가능한 방법으로 영구 삭제하며, 종이
                문서는 분쇄 또는 소각합니다.
              </li>
            </ul>
          </section>

          {/* 6. 이용자의 권리와 행사 방법 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              6. 이용자의 권리와 행사 방법
            </h2>
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정·삭제 요구</li>
              <li>개인정보 처리 정지 요구</li>
              <li>회원 탈퇴(계정 삭제) 요구</li>
            </ul>
            <p className="mt-2">
              권리 행사는 아래 연락처를 통해 요청하실 수 있으며, 지체 없이
              조치하겠습니다.
            </p>
          </section>

          {/* 7. 쿠키 운영 및 관리 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              7. 쿠키(Cookie) 운영 및 관리
            </h2>
            <p>
              서비스는 로그인 세션 유지 및 사용자 경험 향상을 위해 쿠키를
              사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수
              있으나, 이 경우 로그인 등 일부 기능 이용이 제한될 수 있습니다.
            </p>
          </section>

          {/* 8. 개인정보 보호책임자 및 연락처 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              8. 개인정보 보호책임자 및 연락처
            </h2>
            <p>
              본 서비스는 개인이 운영하는 사이트입니다. 개인정보 관련 문의는
              아래 링크를 통해 접수해 주세요.
            </p>
            <p className="mt-2">
              <a
                href={CONTACT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                문의하기 (Google Forms)
              </a>
            </p>
          </section>

          {/* 9. 방침 변경에 관한 사항 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              9. 방침 변경에 관한 사항
            </h2>
            <p>
              본 개인정보 처리방침은 법령 변경 또는 서비스 정책 변경에 따라
              수정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>
        </div>
      </div>

      {/* 하단 링크 */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-on-surface-medium hover:text-on-surface transition-colors"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
