# 바스타임 Mac 작업 인계 — 2026-09-22

## 체크아웃

작업 브랜치: `codex/bathtime-save-archive`. 로컬 main과 origin/main은 이력이 갈라져 있으므로 main으로 합치거나 force push하지 않았다. Mac의 기존 미커밋 작업을 보존한 뒤 이 브랜치를 체크아웃한다.

```sh
git fetch origin
git switch --track origin/codex/bathtime-save-archive
npm ci
npm --prefix apps/admin ci
npm --prefix apps/web ci
```

기존 checkout에 같은 이름의 로컬 브랜치가 있으면 해당 브랜치로 전환하고 원격과 상태를 비교한다. 현재 코드를 다른 main 위에 단순 cherry-pick하면 기존 기반 코드가 빠질 수 있다.

## 현재 운영 상태

- Supabase 기존 프로젝트 `rgbzlnagkbgisljwycio`에 20260922 마이그레이션 3개 및 `archive-save` 함수 적용 완료. 원격 과거 이력 일부가 로컬에 없으므로 무작정 db push/repair하지 않는다.
- 관리자 `https://admin.getbathtime.com/pocket` 배포 완료. 실제 관리자 로그인 후 화면 검증은 남아 있다. 배포 ID `dpl_B4dHwEGHoQxKbjXCfZyJ2P5n6J7q`.
- 웹 개인정보 안내 및 로그인 중복 처리 수정 배포 완료. 최신 웹 배포 ID `dpl_6AieFJuTG25QnXypTSb9EkB2Hcmz`.
- Android 1.1.0(21) 빌드는 성공했고 서명·패키지·bundletool 검증 통과. 사용하지 않는 오버레이/외부 저장소 권한을 발견해 차단한 **1.1.0(22)**가 최신 후보다.
- 최신 EAS 빌드: `009eef17-8b34-4060-9d85-837dfeff123f`. 인계 작성 시 IN_PROGRESS. 먼저 상태를 새로 확인하고, 성공한 실제 AAB의 권한을 다시 검사한다.
- EAS 프로젝트: `getbathtime/getbathtime`, ID `aad216ef-4f0f-46d4-884e-f4f5ab5c4b64`.
- Play 정식 배포는 여전히 1.0.0(19). 새 AAB 업로드·심사·출시를 하지 않았다. 관리형 게시 사용 중이며 기존 Alpha 트랙 재개 미제출 변경 1건은 이번 출시와 별도로 보존했다.

## 최우선: 로그인과 기존 앱 업데이트 검증

사용자가 Play 정식 앱 19번을 Android 16 / SM_S948N에 설치했다. Google 숫자 본인인증 후 로그인 첫 화면으로 돌아오는 문제를 보고했다.

웹 Supabase의 detectSessionInUrl 자동 교환과 AuthCallback의 수동 교환 중복을 실제 SDK로 재현했다. `apps/web/lib/auth.ts` 자동 처리를 끄고 배포했다. `scripts/test_web_auth_callback.cjs` 회귀 검사 통과. **사용자의 재로그인 결과는 아직 받지 못했다. 해결됐다고 가정하지 않는다.**

Supabase 허용 redirect는 `https://getbathtime.com/auth/callback`, `getbathtime://auth/callback` 및 기존 localhost 두 개다. 변경하지 않았다. 네이티브 AuthProvider와 callback 화면, WebView OAuth 복귀도 실제 기기에서 확인해야 한다.

기존 Play 앱을 삭제하거나 데이터를 초기화하지 말고 로그인/저장을 만든 후 업데이트해서 유지 여부를 검증한다. EAS 업로드 키와 Play 앱 서명 키는 다르므로 EAS 서명 APK를 Play 설치본 위에 바로 덮어쓸 수 없다. Play에서 서명한 테스트 업데이트 경로를 사용한다. 기존 내부 테스트 트랙은 일시중지/버전 8 상태였다.

## Mac에서 별도 연결할 설정

- `.env.local`, 관리자 `.env.local`, CLI 로그인, 서비스 역할 키, keystore, `app/google-services.json`은 Git에 넣지 않았다.
- 앱 공개 설정: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. 기존 EAS production 환경에서 확인한다.
- 관리자/웹: 기존 Vercel 프로젝트의 환경을 사용한다. 관리자 허용 이메일은 실제 DB admin allowlist와 일치해야 한다. 서비스 역할 키를 클라이언트에 넣지 않는다.
- Firebase `getbathtime-e1975`의 기존 Android 앱 설정 파일을 다시 내려받아 `app/google-services.json`에 둔다. 실제 서비스 계정 파일과 혼동하지 않는다.
- Android 기존 EAS 원격 keystore를 재사용한다. 새 키 생성/교체하지 않는다.
- 관리자 Vercel 프로젝트 `admin-bathtime`, root `apps/admin`. 웹 프로젝트 `get-bathtime`, root `apps/web`. 배포 때 프로젝트 및 `--local-config apps/admin/vercel.json` 또는 `apps/web/vercel.json`을 명시한다. 루트 vercel.json은 이전 Expo 웹용이다.
- Windows의 DPAPI 암호화 DB 백업/복원 자료는 tmp에만 있고 Mac으로 이동되지 않는다. 운영 DB 변경 전 접근 가능한 새 백업을 준비한다. 이전 auth/public 복원과 37개 테이블 비교는 통과했다.

## 검증 기록과 실행

이전 전체 Jest 50개 스위트/310개 테스트, 보관함 34개, DB 52개, 운영 Supabase 임시 계정 검증 16개 통과. 최신 웹·관리자 production build 및 의존성 검사 통과. 실제 Google 로그인·오프라인 공유·계정 전환·토큰 만료·업데이트는 자동 검사만으로 완료 처리하지 않는다.

```sh
npx tsc --noEmit
npx jest src/pocket/__tests__ --runInBand
node scripts/test_web_auth_callback.cjs
npm --prefix apps/admin run build
npm --prefix apps/web run build
```

DB 검사는 PGlite 별도 설치 후 `node scripts/test_archive_database.mjs <PGlite dist/index.js 절대경로>`로 실행할 수 있다. 운영 테스트 임시 사용자/자료는 제거했다.

## 제품·에이전트 기준

목욕 관련 원문 안의 장소·제품·팁만 정리한다. 외부 확인은 정확한 위치 연결까지. 동일 장소 팁은 출처·시점·조건을 보존하며 통합하고 상충은 숨기지 않는다. 관련 없음과 확인 불가를 구분한다.

Mac에서도 사용할 수 있도록 `.agents/skills/bathtime-content-organizer/`에 스킬을 포함했다. Windows 개인 전역 경로에 의존하지 말고 저장소 스킬을 읽는다. 이 기준의 앱 분류 UI·공용 팁 통합까지 구현된 것은 아니다. 초기 시안은 이전 조사 방식의 예시를 포함한다.

새 정리 전용 Codex 작업 생성은 요청했으나 clientThreadId만 반환됐고 실제 threadId를 확인하지 못했다. Mac에서 스킬을 읽는 새 작업으로 이어갈 수 있다.

단계 6은 실제 출시 후 1~2주 관찰이다. 아직 시작하지 않았으며 전체 목표 미완료. 상세 기록은 `bathtime-pivot-implementation-status.md`, 실행 절차는 `../03-analysis/bathtime-pivot-release-runbook.md`를 참고한다.
