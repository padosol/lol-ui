"use client";

import Link from "next/link";

export default function TermsOfServicePageClient() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl bg-surface-1 rounded-2xl border border-divider p-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">이용약관</h1>
        <p className="text-sm text-on-surface-disabled mb-8">
          시행일: 2026년 3월 18일
        </p>

        <div className="space-y-8 text-sm text-on-surface-medium leading-relaxed">
          {/* 제1조 목적 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제1조 (목적)
            </h2>
            <p>
              본 약관은 METAPICK(이하 &quot;서비스&quot;)이 제공하는 리그 오브
              레전드 전적 검색 서비스의 이용과 관련하여 서비스와 이용자 간의
              권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 정의 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제2조 (정의)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium text-on-surface">
                  &quot;서비스&quot;
                </span>
                란 METAPICK이 제공하는 리그 오브 레전드 전적 검색, 챔피언 통계,
                패치노트 등 관련 웹 서비스를 말합니다.
              </li>
              <li>
                <span className="font-medium text-on-surface">
                  &quot;회원&quot;
                </span>
                이란 서비스에 로그인하여 본 약관에 따라 이용 계약을 체결한 자를
                말합니다.
              </li>
              <li>
                <span className="font-medium text-on-surface">
                  &quot;비회원&quot;
                </span>
                이란 로그인하지 않고 서비스를 이용하는 자를 말합니다.
              </li>
            </ul>
          </section>

          {/* 제3조 약관의 효력 및 변경 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제3조 (약관의 효력 및 변경)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.</li>
              <li>
                서비스는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며,
                변경된 약관은 서비스 내 공지를 통해 안내합니다.
              </li>
              <li>
                회원이 변경된 약관에 동의하지 않을 경우 회원 탈퇴를 할 수
                있으며, 변경된 약관의 효력 발생일 이후에도 서비스를 계속
                이용하는 경우 약관 변경에 동의한 것으로 봅니다.
              </li>
            </ul>
          </section>

          {/* 제4조 서비스의 제공 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제4조 (서비스의 제공)
            </h2>
            <p>서비스는 다음과 같은 기능을 제공합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>리그 오브 레전드 소환사 전적 검색</li>
              <li>챔피언 통계 및 분석 정보</li>
              <li>패치노트 정보 제공</li>
              <li>랭킹(리더보드) 정보 제공</li>
              <li>기타 서비스가 추가 개발하는 기능</li>
            </ul>
          </section>

          {/* 제5조 서비스 이용 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제5조 (서비스 이용)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 등
                운영상 필요한 경우 일시적으로 중단될 수 있습니다.
              </li>
              <li>
                비회원도 전적 검색 등 기본 기능을 이용할 수 있으며, 일부 기능은
                로그인한 회원에게만 제공될 수 있습니다.
              </li>
            </ul>
          </section>

          {/* 제6조 회원가입 및 계정 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제6조 (회원가입 및 계정)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                회원가입은 Google OAuth를 통해 이루어지며, 로그인 시 본 약관 및
                개인정보 처리방침에 동의한 것으로 간주합니다.
              </li>
              <li>
                회원은 자신의 계정 정보를 정확하게 유지할 책임이 있습니다.
              </li>
              <li>
                회원은 자신의 계정을 제3자에게 양도하거나 대여할 수 없습니다.
              </li>
            </ul>
          </section>

          {/* 제7조 회원 탈퇴 및 자격 상실 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제7조 (회원 탈퇴 및 자격 상실)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                회원은 언제든지 서비스에 탈퇴를 요청할 수 있으며, 서비스는
                즉시 회원 탈퇴를 처리합니다.
              </li>
              <li>
                다음의 경우 서비스는 회원 자격을 제한 또는 상실시킬 수
                있습니다.
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>타인의 정보를 도용한 경우</li>
                  <li>서비스 운영을 고의로 방해한 경우</li>
                  <li>관련 법령 또는 본 약관을 위반한 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* 제8조 서비스 중단 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제8조 (서비스 중단)
            </h2>
            <p>
              서비스는 시스템 유지보수, 천재지변, 기타 불가항력적 사유로 인해
              서비스 제공이 어려운 경우 사전 공지 후 서비스를 일시적으로
              중단할 수 있습니다. 불가피한 경우 사후 공지로 대체할 수 있습니다.
            </p>
          </section>

          {/* 제9조 책임의 제한 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제9조 (책임의 제한)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                서비스는 무료로 제공되며, 서비스 이용과 관련하여 발생하는
                손해에 대해 관련 법령에서 정하는 범위 내에서만 책임을 집니다.
              </li>
              <li>
                서비스에서 제공하는 전적, 통계 등의 데이터는 Riot Games API를
                기반으로 하며, 데이터의 정확성이나 완전성을 보장하지 않습니다.
              </li>
              <li>
                이용자가 서비스를 이용하여 기대하는 수익이나 결과를 얻지
                못하였더라도 서비스에 책임을 물을 수 없습니다.
              </li>
            </ul>
          </section>

          {/* 제10조 지적재산권 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제10조 (지적재산권)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                서비스가 자체적으로 제작한 콘텐츠에 대한 저작권은 서비스에
                귀속됩니다.
              </li>
              <li>
                리그 오브 레전드 및 관련 상표는 Riot Games, Inc.의 자산입니다.
                METAPICK은 Riot Games가 보증하지 않으며, Riot Games 또는 리그
                오브 레전드의 제작·관리에 공식적으로 관여하는 어떤 주체의
                의견도 반영하지 않습니다.
              </li>
            </ul>
          </section>

          {/* 제11조 분쟁 해결 */}
          <section>
            <h2 className="text-lg font-semibold text-on-surface mb-3">
              제11조 (분쟁 해결)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                서비스와 이용자 간에 발생한 분쟁은 상호 협의하여 해결하는 것을
                원칙으로 합니다.
              </li>
              <li>
                협의가 이루어지지 않을 경우 대한민국 법률을 준거법으로 하며,
                관할 법원은 민사소송법에 따릅니다.
              </li>
            </ul>
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
