#!/usr/bin/env bash
# 로컬 lol-server 에 e스포츠 로스터 예시 데이터를 넣는다 (MP-188 공통 기반).
#
# 공개 화면(MP-192·193·195)을 관리자 화면(MP-189~191)이 끝나기 전에 만들 수 있게,
# 관리자 API 를 불러 리그·시즌·팀·인물·계약 사건을 채운다. SQL 이 아니라 API 를 쓰는 이유:
#   - 서버의 사건 규칙(재계약·팀 내 이동·임대·은퇴 처리)을 그대로 거쳐 뷰가 기대하는 상태가 만들어진다.
#   - 스키마(V5)가 바뀌어도 이 스크립트는 그대로 쓸 수 있다.
#
# 팀·인물은 모두 가상이다(실존 선수의 계약을 지어내지 않는다). 날짜는 2026-11-23 기준으로 짰다.
#   글로벌 공식 계약 종료일(11월 세 번째 월요일): 2022-11-21, 2024-11-18, 2026-11-16, 2027-11-15, 2028-11-20
#
# 담긴 사례
#   alpha(LCK) / alpha_ca(CL, 상위 팀 alpha)  — LCK ↔ CL 전환, 콜업(팀 내 이동)
#   arcturus  재계약 두 번(소속 기간 한 줄)        bastion   2027-11-15 만료 예정
#   cinder    CL → LCK 콜업                       dynamo    CL 계약 만료 → FA
#   echo      감독 재계약                         flint     CL 코치
#   gale      alpha → bravo 임대(원 소속 loanedOut, 임차팀 onLoan)
#   harbor    charlie → bravo 이적                ion       FA 이지만 다음 계약(charlie, 12-01) 확정
#   jade      계약 중 은퇴(원 소속 권리 기간)       kite      군 입대로 비활동
#   lumen     선수 은퇴 후 감독(retiredAsPlayer)   nova      방출 → FA
#   pax       bravo 코치                         mira      계약·사건 이력 없음(상태 없음 — FA 로 보이면 안 된다)
#   charlie   2026-01-01 에 Delta Esports → Charlie Gaming 개명(2025 시즌 로스터는 옛 이름)
#
# 소환사 계정 연결은 넣지 않는다. puuid 는 Riot API 키(환경)마다 달라 로컬에서 Riot ID 로 직접 찾아 연결한다.
#
# 준비
#   1. lol-server 를 로스터 API 가 있는 브랜치(feat/esports-roster-schema, #189 머지 후에는 develop)로 띄운다.
#   2. 내 회원을 ADMIN 으로 바꾼다:  UPDATE app.member SET role = 'ADMIN' WHERE email = '<내 이메일>';
#   3. 다시 로그인한다(토큰에 발급 시점 역할이 박힌다). 브라우저 쿠키 accessToken 값을 복사한다.
#
# 사용
#   ACCESS_TOKEN=<accessToken 쿠키 값> scripts/esports-local-seed.sh
#   API=http://localhost:8100/api ACCESS_TOKEN=... scripts/esports-local-seed.sh   # API 기본값
#
# 다시 돌려도 된다. 이미 있는 데이터(409)와 이미 반영된 사건(400·409)은 이유를 찍고 건너뛴다.
set -euo pipefail

API="${API:-http://localhost:8100/api}"
ADMIN="$API/v1/admin/esports"
: "${ACCESS_TOKEN:?ACCESS_TOKEN 이 필요합니다. 사용법은 스크립트 머리 주석을 보세요.}"

ok=0
skipped=0
body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT

# call METHOD PATH LABEL [JSON]
call() {
  local method="$1" path="$2" label="$3" body="${4:-}"
  local args=(-sS -o "$body_file" -w '%{http_code}' -X "$method"
    -H "Authorization: Bearer $ACCESS_TOKEN" -H 'Content-Type: application/json')
  if [[ -n "$body" ]]; then args+=(--data "$body"); fi

  local status
  status="$(curl "${args[@]}" "$ADMIN$path")"
  case "$status" in
    2??)
      ok=$((ok + 1))
      echo "  ok    $label"
      ;;
    400 | 409)
      skipped=$((skipped + 1))
      echo "  skip  $label — $status $(grep -o '"message":"[^"]*"' "$body_file" | head -1 | cut -d'"' -f4)"
      ;;
    401 | 403)
      echo "권한이 없습니다($status). ADMIN 으로 바꾼 뒤 다시 로그인해 토큰을 새로 받으세요." >&2
      exit 1
      ;;
    *)
      echo "실패($status): $label" >&2
      cat "$body_file" >&2
      exit 1
      ;;
  esac
}

echo "[리그]"
call POST /leagues "lck" '{"leagueId":"lck","name":"LCK","nameAcronym":"LCK","region":"KR","international":false,"sortOrder":1}'
call POST /leagues "lck_cl" '{"leagueId":"lck_cl","name":"LCK Challengers League","nameAcronym":"LCK CL","region":"KR","international":false,"sortOrder":2}'
call POST /leagues "worlds" '{"leagueId":"worlds","name":"World Championship","nameAcronym":"Worlds","international":true,"sortOrder":1}'

echo "[시즌]"
call POST /leagues/lck/seasons "lck_2025" '{"seasonId":"lck_2025","name":"LCK 2025","year":2025,"startDate":"2025-01-15","endDate":"2025-09-28","sortOrder":1}'
call POST /leagues/lck/seasons "lck_2026" '{"seasonId":"lck_2026","name":"LCK 2026","year":2026,"startDate":"2026-01-14","endDate":"2026-09-27","sortOrder":1}'
call POST /leagues/lck_cl/seasons "lck_cl_2026" '{"seasonId":"lck_cl_2026","name":"LCK CL 2026","year":2026,"startDate":"2026-01-19","endDate":"2026-09-20","sortOrder":1}'

echo "[팀]"
call POST /teams "alpha" '{"teamId":"alpha","teamCode":"ALP","name":"Alpha Esports","homeLeagueId":"lck","foundedAt":"2015-01-01","nameSince":"2015-01-01"}'
call POST /teams "alpha_ca (상위 팀 alpha)" '{"teamId":"alpha_ca","teamCode":"ALPA","name":"Alpha Esports Academy","homeLeagueId":"lck_cl","parentTeamId":"alpha","foundedAt":"2021-01-01","nameSince":"2021-01-01"}'
call POST /teams "bravo" '{"teamId":"bravo","teamCode":"BRV","name":"Bravo Gaming","homeLeagueId":"lck","foundedAt":"2016-01-01","nameSince":"2016-01-01"}'
call POST /teams "charlie (옛 이름 Delta Esports)" '{"teamId":"charlie","teamCode":"DEL","name":"Delta Esports","homeLeagueId":"lck","foundedAt":"2020-01-01","nameSince":"2020-01-01"}'
call POST /teams/charlie/renames "charlie 개명 → Charlie Gaming" '{"renamedOn":"2026-01-01","teamCode":"CHG","name":"Charlie Gaming"}'

echo "[인물]"
person() { call POST /persons "$1" "{\"personId\":\"$1\",\"nickName\":\"$2\",\"nationality\":\"KR\"}"; }
person arcturus Arcturus
person bastion Bastion
person cinder Cinder
person dynamo Dynamo
person echo Echo
person flint Flint
person gale Gale
person harbor Harbor
person ion Ion
person jade Jade
person kite Kite
person lumen Lumen
person nova Nova
person pax Pax
person mira Mira

# event PERSON KIND LABEL JSON
event() { call POST "/persons/$1/$2" "$1 $3" "$4"; }

echo "[계약 사건]"
event arcturus signings "입단 alpha" '{"teamId":"alpha","role":"PLAYER","position":"MID","date":"2023-11-21","endDate":"2024-11-18"}'
event arcturus renewals "재계약" '{"teamId":"alpha","role":"PLAYER","position":"MID","date":"2024-11-19","endDate":"2026-11-16"}'
event arcturus renewals "재계약" '{"teamId":"alpha","role":"PLAYER","position":"MID","date":"2026-11-17","endDate":"2028-11-20"}'

event bastion signings "입단 alpha" '{"teamId":"alpha","role":"PLAYER","position":"TOP","date":"2025-11-18","endDate":"2027-11-15"}'

event cinder signings "입단 alpha_ca" '{"teamId":"alpha_ca","role":"PLAYER","position":"JGL","date":"2025-11-18","endDate":"2027-11-15"}'
event cinder moves "콜업 alpha_ca → alpha" '{"teamId":"alpha","role":"PLAYER","position":"JGL","date":"2026-06-01"}'

event dynamo signings "입단 alpha_ca (2026-11-16 만료)" '{"teamId":"alpha_ca","role":"PLAYER","position":"AD","date":"2025-11-18","endDate":"2026-11-16"}'

event echo signings "감독 alpha" '{"teamId":"alpha","role":"HEAD_COACH","date":"2024-11-19","endDate":"2026-11-16"}'
event echo renewals "감독 재계약" '{"teamId":"alpha","role":"HEAD_COACH","date":"2026-11-17","endDate":"2027-11-15"}'

event flint signings "코치 alpha_ca" '{"teamId":"alpha_ca","role":"COACH","date":"2025-11-18","endDate":"2027-11-15"}'

event gale signings "입단 alpha" '{"teamId":"alpha","role":"PLAYER","position":"SPT","date":"2024-11-19","endDate":"2027-11-15"}'
event gale loans "임대 → bravo" '{"teamId":"bravo","date":"2026-11-20","endDate":"2027-11-15"}'

event harbor signings "입단 charlie" '{"teamId":"charlie","role":"PLAYER","position":"TOP","date":"2024-11-19","endDate":"2026-11-16"}'
event harbor transfers "이적 → bravo" '{"teamId":"bravo","role":"PLAYER","position":"TOP","date":"2026-03-01","endDate":"2027-11-15"}'

event ion signings "입단 bravo (2026-11-16 만료)" '{"teamId":"bravo","role":"PLAYER","position":"MID","date":"2024-11-19","endDate":"2026-11-16"}'
event ion signings "다음 계약 charlie (12-01 효력)" '{"teamId":"charlie","role":"PLAYER","position":"MID","date":"2026-12-01","endDate":"2028-11-20"}'

event jade signings "입단 charlie" '{"teamId":"charlie","role":"PLAYER","position":"JGL","date":"2025-11-18","endDate":"2027-11-15"}'
event jade retirements "계약 중 은퇴" '{"date":"2026-08-01"}'

event kite signings "입단 charlie" '{"teamId":"charlie","role":"PLAYER","position":"AD","date":"2025-11-18","endDate":"2027-11-15"}'
event kite hiatuses "군 입대" '{"date":"2026-10-01","reason":"MILITARY"}'

event lumen signings "선수 입단 bravo" '{"teamId":"bravo","role":"PLAYER","position":"MID","date":"2022-11-22","endDate":"2024-11-18"}'
event lumen retirements "선수 은퇴" '{"date":"2024-11-19"}'
event lumen signings "감독 charlie" '{"teamId":"charlie","role":"HEAD_COACH","date":"2025-11-18","endDate":"2027-11-15"}'

event nova signings "입단 bravo" '{"teamId":"bravo","role":"PLAYER","position":"SPT","date":"2025-11-18","endDate":"2027-11-15"}'
event nova releases "방출" '{"date":"2026-07-01"}'

event pax signings "코치 bravo" '{"teamId":"bravo","role":"COACH","date":"2025-11-18","endDate":"2027-11-15"}'

echo
echo "완료: 반영 $ok, 건너뜀 $skipped"
echo "확인: curl -s $API/v1/esports/persons?status=FREE_AGENT"
echo "검증: 관리자 검증 결과($ADMIN/roster-issues)가 비어 있으면 정상"
