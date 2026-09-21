# 바스타임 저장형 피벗 구현 상태

기준: 2026-09-22. **개발 중이며 운영 배포·Google Play 제출은 하지 않았다.**

## 사용자 결정

- 별도 베타 서비스보다 기존 Android 앱을 빠르게 전환한다.
- 기존 패키지 `com.bathtimestudio.bathtime`와 업로드 서명을 유지한다.
- 장소·제품 중심 모바일 보관함, 화이트/민트, Pretendard, 간결한 한국어.
- 첫 접수는 Android 공유와 링크 붙여넣기. DM·자동 분석·결제는 후속 범위.
- 단계 6의 출시 후 1~2주 관찰은 실제 데이터가 쌓인 뒤 평가한다.

## 로컬 구현

| 영역 | 구현 | 남은 검증 |
| --- | --- | --- |
| 데이터 | 계정별 원문/저장, 장소·제품, 다대다 연결, 작업, 수정 이력, 이벤트와 RLS | 기존 운영 스키마/백업 확인 및 실제 Supabase 검증 |
| 접수 | URL 정규화, 중복·요청량 제한, 인증된 Edge 접수 | 함수 배포, 실계정 만료·권한 테스트 |
| Android | 공유 수신 팝업, 영속 큐, WorkManager, 암호화된 세션 저장 | 정식 네이티브 빌드, 오프라인·종료·토큰 갱신·기존 버전 업데이트 테스트 |
| 앱 | 보관함, 검색/분류, 상세, 출처, 지도/제품 이동, 삭제, 기존 보관함 링크 | 로그인 연동된 실기기 테스트, 콘텐츠 이미지/제품 사례, 접근성 |
| 관리자 | 작업 목록, JSON 내보내기/미리보기/검증/반영, 수정 이력 | 배포 환경 로그인, 실제 큐 처리, 작업량·시간 측정 |
| 운영 | 최소 이벤트 기록, 별도 공개 사실/개인 저장 설계 | 보유·삭제 정책, 계정 삭제, 백업 복구, 장애 대응, 스토어 문구 |

현재 운영용 기본 카드에는 외부 콘텐츠 이미지를 무단 재배포하지 않도록 텍스트 대체 이미지가 쓰인다. 이전 3218 시안과 실제 Expo 앱 3219는 별개다. 시안의 3건을 운영 DB에 넣었다고 간주하면 안 된다.

## 검증 기록

- 새 보관함 Jest: URL/JSON 22건, outbox 8건, 카드 집계 4건.
- 실제 PostgreSQL 엔진(PGlite)에서 마이그레이션·RLS·RPC·운영 집계 **42개 검증 통과**. 운영 DB에 적용한 결과가 아니다.
- 앱, 관리자, 기존 웹 TypeScript 검사 통과.
- 관리자 Next.js 배포용 빌드 성공. 작업 목록의 `force-dynamic` 반영 후 다시 빌드해 통과했다.
- 실제 Expo 모바일 웹에서 게스트 링크 저장 및 새로고침 후 보존 확인.
- 전체 Jest: **50개 스위트, 310개 테스트 모두 통과**. 기존 완료 화면의 바뀐 제목을 테스트에 반영했고, 기존 메모리 중복 저장 테스트에 동일한 완료 시각을 명시해 실행 시간에 따른 불안정을 제거했다. 검사 자체는 유지했다.
- 초기 전체 검사에서 React Native 0.81.5 안에 0.86.0이 중복 설치된 것을 확인. root 버전 override 및 잘못된 하위 lock 항목 정리로 네이티브 브리지 오류가 해결됐다. npm install에서 불필요한 49개 패키지가 제거됐다.
- Android prebuild는 `app/google-services.json` 부재로 실패. 가짜 Firebase 파일이나 새 업로드 키는 만들지 않았다.
- 공유 모듈 `:bathtime-pocket:compileDebugKotlin` 컴파일 성공. 정식 AAB 또는 실기기 검증을 대신하지 않는다.
- `expo export --platform android --output-dir tmp/pocket-android-export` 종료 코드 0. Android Hermes 코드/자산 묶음 생성 성공. Firebase 설정 파일 부재 경고가 있으며, 서명된 AAB는 아니다.
- 의존성 정리 중 종료된 Metro를 확인 후 다시 실행했다. 현재 `/status`는 200이고 웹 묶음 생성은 성공했지만 `/pocket` HTTP 응답 지연과 인앱 브라우저 탭 오류가 있어 최신 웹 화면 재검증은 미완료다. 현재 Metro 세션은 26828, 새 미리보기 탭은 13이다. 이전 게스트 저장 확인과 구분한다.

## 반드시 이어서 해결할 항목

1. Supabase/Expo 기존 계정 접근, 실제 Firebase 설정과 업로드 키 확인. 비밀값은 문서/대화에 출력하지 않는다.
2. 요청 번호별 서버 접수증을 추가했다. 응답 유실 후 취소, 취소보다 늦게 온 저장, 오래된 삭제 재시도와 새로운 재저장을 DB/웹 큐 테스트로 검증했다. 두 번째 마이그레이션과 접수 함수를 함께 배포해야 한다. 네이티브에서도 이 프로토콜을 사용하며 실기기 검증은 남아 있다.
3. 네이티브 대기열 변경 이벤트로 전송 완료 시 보관함을 갱신하도록 구현하고 Kotlin 컴파일을 통과했다. 실제 Android 이벤트 전달은 실기기 검증이 필요하다.
4. Android Keystore 세션 갱신과 Supabase SDK의 상호작용을 만료·로그아웃·계정 전환으로 검증. 백업 제외 XML 플러그인도 완전한 prebuild 후 확인한다.
5. 저장 삭제 후 원문/작업/수정 이력의 실제 보유·파기 정책 정합성. 현재 저장 관계 삭제와 계정 삭제 FK는 있으나 운영 파기 절차까지 완성된 것은 아니다.
6. 실제 Supabase에서 관리자 허용 목록, 앱 사용자 A/B, 익명 권한을 다시 확인한다. 서비스 역할 키를 앱에 넣지 않는다.
7. 관리자 기존 대상 연결/분리·이력 복원·수정, 장소 3건 및 제품 5건으로 운영 입력 흐름 검증.
8. 기존 로그인·저장 유지, 개인정보 안내·계정 삭제·지원 경로·스토어 등록정보·최종 빌드 검증 후 서명된 AAB 제출.
9. 출시가 실제 확인된 뒤 1~2주 관찰 시작. 접수 실패, 가장 오래된 대기, 정리 시간, 재방문, 원문/지도/제품 이동을 관찰한다.

두 번째 목표 작업 회차에서도 Supabase는 로그인 화면, Expo는 로그인 전 상태였고 Firebase 파일도 없었다. 로컬 검증은 진전됐으므로 목표를 완료/blocked로 처리하지 않았다. 실행 절차는 `docs/03-analysis/bathtime-pivot-release-runbook.md`에 있다.

세 번째 회차에서도 동일한 외부 연결 장애를 재확인했다. Supabase와 Expo 모두 실제 로그인 폼을 표시하며 `app/google-services.json`은 존재하지 않는다. 운영 프로젝트·환경·서명 확인 없이 실제 앱 접수/계정/업데이트 검증과 AAB 출시를 진행할 수 없다. 단계 1~5의 운영 검증 및 단계 6의 실제 관찰은 미완료다. 목표를 완료로 표시하지 않고 사용자 로그인/설정 제공을 기다리는 차단 상태로 전환한다. 로컬 `/status`는 200, `/pocket`은 5초 응답 제한을 넘겨 최신 미리보기 검증도 남겨 둔다.

## Google Play 확인 사항

- 개발자: BATH TIME Studio. 바스타임 프로덕션 출시 상태와 관리형 게시 사용을 확인했다.
- 게시 개요에 **기존 '비공개 테스트 - Alpha / 트랙 다시 시작' 변경 1건**이 제출 대기로 있었다. 새 업데이트와 무관하게 일괄 제출하지 않는다.
- '변경사항이 게시 준비됨' 구역을 펼쳐 비어 있음을 확인했다.
- 새 번들 업로드, 심사 제출, 관리형 게시의 실제 프로덕션 게시를 각각 확인해야 한다. 심사 대기를 출시 완료로 보고하지 않는다.

## 로컬 재검증 명령

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/jest/bin/jest.js src/pocket/__tests__ --runInBand
node scripts/test_archive_database.mjs tmp/pocket-db-test/node_modules/@electric-sql/pglite/dist/index.js
node apps/admin/node_modules/typescript/bin/tsc --noEmit -p apps/admin/tsconfig.json
```

현재 npm이 PATH에 없어 `node tmp/tooling/npm/package/bin/npm-cli.js`를 사용했다. PGlite는 `tmp/pocket-db-test`에 격리 설치했으므로 다른 기기에서는 도구 설치가 필요하다.

## 계정 접근 및 업로드 키 재확인

Supabase와 Expo 웹 로그인이 완료된 상태를 확인했다. Expo의 getbathtime 프로젝트에서 기존 Android 패키지 com.bathtimestudio.bathtime의 기본 Build credentials에 Android upload keystore(JKS)가 등록되어 있다(등록일 2026-04-27). 따라서 맥의 로컬 키 파일을 찾기 전에 기존 EAS 원격 자격 증명을 재사용할 수 있는 경로가 확인됐다. 키를 다운로드하거나 교체하지 않았다. 실제 빌드 전 Google Play 업로드 인증서와 지문 대조는 아직 필요하다. FCM 서비스 계정 등록도 확인했지만 앱용 google-services.json 확보와는 별개다.

## 2026-09-22 운영 연결 진행 (현재 상태)

- EAS CLI 및 Supabase CLI 로그인 완료. EAS CLI 접근은 사용자에게 승인받았다. Supabase 프로젝트 `rgbzlnagkbgisljwycio`를 기존 EAS 환경 변수 및 실제 DB 테이블과 대조했다.
- EAS 업로드 키의 SHA-1/SHA-256 지문을 Play Console 업로드 키 인증서와 대조해 일치를 확인했다. 기존 Play 프로덕션 버전은 19(1.0.0)이다.
- 기존 Firebase 프로젝트 `getbathtime-e1975`에서 Android 설정을 다운로드하여 `app/google-services.json`에 연결했다. 공개 앱 설정만 사용하며 서비스 계정 키를 앱에 넣지 않았다.
- 로컬 `.env.local`, 관리자 `.env.local`에 기존 공개 Supabase 설정을 연결했고 관리자 UI 허용 이메일은 기존 DB 허용 목록과 맞췄다. 두 파일은 Git에서 제외된다.
- 운영 DB 전체 custom-format 백업 생성 후 Windows DPAPI(CurrentUser)로 암호화했다. 파일: `tmp/pivot-before-migration.dump.dpapi`. 평문 덤프는 자체 검증 후 제거했다. 복원용 로컬 DB는 사용자 전용 ACL의 `tmp/pivot-restore` 아래에 있으며 127.0.0.1:54329에서 비밀번호 인증으로 실행 중이다.
- 백업의 auth/public 스키마를 별도 PostgreSQL 17에 복원(오류 0)하고 마이그레이션을 검증했다. 운영 DB와 복원본의 public 37개 테이블을 UTC 및 C 정렬 기준으로 건수·행 내용 해시 비교하여 모두 일치했다. Supabase의 모든 플랫폼 내부 스키마까지 복원한 검증은 아니다.
- 두 기본 마이그레이션과 migration history를 하나의 트랜잭션으로 운영 반영했다. 기존 원격 이력 중 로컬에 없는 과거 버전은 수정하지 않았다. `archive-save` Edge Function을 API 방식으로 배포했다.
- 삭제 시 원문/정리 이력/미사용 비공개 대상을 파기하고, 요청 기록에는 URL 대신 해시를 남기는 세 번째 마이그레이션(`20260922002000_archive_delete_private_source.sql`)을 추가했다. 로컬 DB 52개 검증 및 복원 DB 적용을 통과한 후 운영에 반영했다.
- 실제 Supabase Auth 임시 계정으로 Edge 저장/중복 접수/계정 간 격리/일반 사용자 관리자 거부/관리자 반영/이전 버전 충돌/삭제/늦은 재전송/새 저장 유지/익명 거부 등 16개 검증을 통과했다. 3개 장소+5개 제품은 구조 검증용 임시 자료이며 실제 콘텐츠 연구 결과가 아니다. 각 실행의 임시 계정/관리자 허용 항목/대상을 제거했다. 기존 저장 4건, 기존 콘텐츠 62건, 관리자 허용 항목 1건을 유지했다.
- Android 전체 prebuild 및 arm64 디버그 APK 빌드 성공. 전체 빌드에서 발견한 잘못된 `windowDimAmount`를 `backgroundDimAmount`로 수정하고 오래된 autolinking의 com.app 캐시를 다시 생성했다. `allowBackup=false`와 두 백업 제외 XML 생성도 확인했다.
- 앱 운영자 정리 안내, 개인정보 안내의 링크/처리 기록/삭제 범위를 보완하고 설정 버전을 Expo config에서 읽도록 변경했다. 이후 TS 검사 및 보관함 34개 테스트 통과.
- 1.1.0/20 EAS AAB 빌드: `80815c49-2ad3-495f-bd19-7719ae18fac7`. 이 빌드는 마지막 문구 변경 전 후보이므로 출시용으로 사용하지 않는다. 최종 문구를 포함한 1.1.0/21 빌드를 추가 요청 중이며 로그는 `tmp/pivot-eas-final-submit.txt`에 있다.
- `.easignore`의 android/ios 제외 범위를 루트로 한정해 로컬 공유 모듈의 Android 코드가 클라우드 빌드에 포함되게 했다. 모듈 빌드 산출물과 자격 증명은 제외한다.
- Vercel CLI는 아직 로그인 대기다. 사용자는 기존 계정 로그인 및 CLI 접근을 승인했지만 브라우저는 로그인 폼 상태였다. 기존 관리자 사이트에 아직 배포하지 않았다. 새 사이트를 임의 생성하지 않는다.
- 로컬 관리자 로그인 페이지는 HTTP 200 및 브라우저로 확인했다. 실제 관리자 UI 로그인/반영은 미완료. 관리자 최종 production build 실행 중.
- 실기기가 adb에 연결되어 있지 않다. 새 앱의 실기기 로그인/오프라인/토큰 갱신/계정 전환 및 Play 설치본 업데이트 호환 확인은 아직 남아 있다. Metro `/pocket` 응답 지연도 미해결이다.
- Play에 번들을 업로드하거나 심사 제출/게시하지 않았다. 기존 Alpha 재개 변경은 건드리지 않았다. 출시 후 1~2주 관찰도 아직 시작하지 않았다.

추가 확인: 최종 문구 포함 EAS 빌드는 `fc9b1145-3443-4578-a382-6cbcfbbba9fd`(1.1.0/21)이며 현재 빌드 중이다. 관리자 production build도 통과했다. 복원 검증용 PostgreSQL 서버는 정상 종료했고, 임시 서비스 역할 키 파일과 만료된 덤프 접속 스크립트는 제거했다. 암호화된 백업 및 사용자 전용 ACL의 복원 검증 자료는 남겨뒀다.

## 2026-09-22 관리자 운영 배포 완료

- 사용자 승인 후 Vercel CLI 로그인 완료. 기존 `admin-bathtime` 프로젝트(루트 `apps/admin`)를 사용했다.
- `.vercelignore`를 추가해 로컬 백업·임시 도구·인증 파일·네이티브 빌드 산출물을 업로드에서 제외했다. dry-run 파일 목록을 확인한 뒤 배포했다.
- 클라우드 빌드에서 발견한 의존성 취약점을 수정했다. 관리자 Next.js 15.5.25, sharp 0.35.4 및 PostCSS/nanoid lock 갱신. 로컬과 Vercel 설치 검사 모두 취약점 0건이며 TypeScript 및 production build 통과.
- 최종 배포 `dpl_B4dHwEGHoQxKbjXCfZyJ2P5n6J7q`를 production으로 promote했다. `admin.getbathtime.com` inspect 결과가 해당 Ready 배포와 일치한다.
- `/pocket` 비인증 접근은 307 `/login?next=%2Fpocket`로 이동한다. 운영 도메인의 로그인 폼도 브라우저로 확인했다. 실제 관리자 로그인 후 목록/편집 UI 검증은 사용자 로그인이 필요해 남겨뒀다.
- EAS 최종 1.1.0(21)은 이 시점에도 IN_PROGRESS. Play 업로드·심사·출시는 아직 하지 않았다.

## 2026-09-22 배포 파일 검증 및 실기기 연결

- 1.1.0(21) EAS 빌드는 FINISHED. `tmp/bathtime-1.1.0-21.aab` 다운로드 후 bundletool 검증 및 jarsigner 검증 성공. SHA256 `4C8B6EE27D9109F26772F602C6E348DFB5138F747F862B1A2CCF551A05076C6F`.
- 번들 패키지 `com.bathtimestudio.bathtime`, targetSdk 36, versionCode 21, 기존 Play 업로드 키 지문 일치, 공유 Activity의 SEND/text/plain 및 백업 비활성화 확인.
- 실제 번들에 남아 있던 불필요한 SYSTEM_ALERT_WINDOW, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE를 app.json blockedPermissions에 추가했다. prebuild manifest의 tools:node=remove 확인. 공유 팝업은 Activity 방식이라 오버레이 권한이 필요하지 않다.
- 새 출시 후보 **1.1.0(22)** EAS 빌드 `009eef17-8b34-4060-9d85-837dfeff123f` 접수 후 IN_PROGRESS 확인. 21 대신 22의 완성 번들 권한을 다시 확인해야 한다.
- USB 연결 Android 16 / SM_S948N 확인. 처음에는 별도 pockettest만 있었으나 사용자가 Play 정식 앱을 설치한 뒤 `com.bathtimestudio.bathtime` 1.0.0(19), installer com.android.vending 확인. 로그인·저장 완료 확인 및 실제 업데이트 테스트는 남아 있다. 앱을 제거하거나 데이터를 초기화하지 않았다.
- 공개 웹 `get-bathtime`도 Next.js 15.5.25와 하위 보안 업데이트 적용 후 클라우드 빌드/타입 검사 및 의존성 취약점 0건 확인. 새 개인정보 안내를 배포하고 `dpl_EXkXZoFQDRt2Y8XdkijWyzkws2nN`를 promote했다. 운영 www.getbathtime.com 도메인이 해당 Ready 배포를 가리키며 `/legal/privacy?release=20260922`에서 새 시행일·링크 해시 보유 안내를 확인했다. 홈 HTTP 200.
- 로컬 `.vercel` 연결은 현재 공개 웹 get-bathtime이다. 관리자 후속 배포 때 프로젝트를 명시/재연결해야 한다.
- Play 기존 내부 테스트는 일시중지/버전 8 상태이며, Alpha 재개 미제출 변경 1건은 그대로 보존했다. 아직 새 AAB 업로드·심사·공개 출시는 하지 않았다.

## 기존 1.0.0 로그인 실패 조사

- 사용자가 Android 정식 19번 앱에서 Google 숫자 본인인증 후 로그인 초기 화면으로 돌아온다고 보고했다. 기존 로그인/저장 유지 검증은 이 문제 해결 전까지 미완료다.
- Supabase URL 설정에서 웹 callback과 `getbathtime://auth/callback` 허용을 직접 확인했다. 설정을 임의 확장하지 않았다.
- 웹 Supabase 클라이언트의 자동 URL 코드 교환과 AuthCallback의 수동 교환이 겹치는 문제를 실제 auth-js SDK로 재현했다. 두 번째 처리는 이미 없어진 PKCE verifier 때문에 실패한다. `apps/web/lib/auth.ts`에서 자동 처리를 끄고 수동 콜백 하나만 유지했다.
- 회귀 검사 `node scripts/test_web_auth_callback.cjs`는 실제 웹 클라이언트 설정과 SDK를 사용해 이전 설정 실패/현재 설정 성공을 확인한다. 외부 Google 로그인은 모의 처리이므로 실제 폰 성공을 증명하지 않는다. 웹 TS 및 production build 통과.
- 웹 배포 시 저장소 루트의 Expo dist 설정과 충돌한 실패가 있었다. `apps/web/vercel.json`에 `.next` 출력을 명시하고 `--local-config apps/web/vercel.json`으로 성공 재배포했다.
- 수정 운영 배포는 `dpl_6AieFJuTG25QnXypTSb9EkB2Hcmz`. www.getbathtime.com이 해당 Ready 배포임을 확인하고 사용자에게 앱 재시작·Google 로그인 재시험을 요청했다. 실제 증상 해결 여부는 아직 미확인이며 로그인 완료로 보고하지 않는다.
