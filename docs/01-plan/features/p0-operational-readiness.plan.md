# P0 Operational Readiness Plan

> **Summary**: 현재 구현된 P0 웹 아카이브와 관리자 scaffold를 실제 운영 검증 가능한 P0로 닫기 위한 후속 실행 계획이다.
>
> **Project**: 바스타임
> **Author**: Codex
> **Date**: 2026-05-08
> **Status**: Draft

---

## 1. 배경

현재 P0는 웹 아카이브의 주요 화면과 관리자 화면 골격이 구현되어 있다.

- 사용자 웹: 지금, 탐색, 의식, 제보, 보관함
- 콘텐츠 상세: 구조화 정보, 본문, 연결된 의식
- 저장: 브라우저 또는 네이티브 저장소 기반
- 제보: 웹 localStorage 기반
- 관리자: 콘텐츠, 제보, 의식 프리셋 목록과 상세 scaffold
- 디자인 문서: 최신 시안 기반 컴포넌트 시스템 계획 작성

리뷰 결과, 현재 상태는 **P0 mock/admin scaffold 완료**에 가깝다. 다음 단계에서는 이를 **P0 운영 검증 가능** 상태로 올리는 것을 목표로 한다.

---

## 2. 목표

P0 완료 기준을 다음 흐름이 실제로 이어지는 상태로 정의한다.

```txt
사용자가 좋은 장소/세팅/아이템을 제보한다
→ 운영자가 관리자에서 제보를 확인한다
→ 운영자가 상태를 변경한다
→ 운영자가 콘텐츠 draft로 정리할 수 있다
→ 사용자는 아카이브에서 콘텐츠를 탐색, 저장, 상세 확인, 의식 실행으로 이어간다
```

### Goals

- 웹 제보와 관리자 제보 목록이 같은 저장소를 사용한다.
- 관리자에서 제보 상태 변경이 실제 저장된다.
- 관리자에서 최소한의 콘텐츠 draft 생성 흐름을 제공한다.
- 최신 시안 기준 컴포넌트 시스템을 P0 화면에 단계적으로 적용한다.
- 사용자 노출 copy는 브랜드 언어를 따른다. `루틴`은 사용자 copy에서 `의식`으로 통일한다.
- `npm run typecheck`, `npm --prefix apps/admin run build`, `npm test -- --runInBand`를 모두 통과한다.

### Non-Goals

- 완전한 CMS 에디터
- 커뮤니티, 댓글, 좋아요
- 예약, 결제, 제휴 정산
- 일반 사용자 계정 시스템
- 모든 기존 앱 화면의 전면 리브랜딩
- 관리자 전체 메뉴의 완성형 CRUD

---

## 3. 현재 상태 판정

| 영역 | 현재 상태 | 판정 |
|---|---|---|
| 웹 IA | 핵심 메뉴 구현 | P0 scaffold 완료 |
| 탐색 | 검색, 카테고리, 태그 필터 구현 | 기능은 있음, 최신 3열 시안 미반영 |
| 상세 | 구조화 정보와 본문 렌더링 구현 | raw enum 노출 가능성 있음 |
| 저장 | localStorage/AsyncStorage 기반 구현 | P0 개인 저장으로 충분 |
| 제보 | localStorage 저장 | 관리자와 미연결 |
| 관리자 콘텐츠 | 목록/상세/등록 화면 scaffold | 저장 동작 없음 |
| 관리자 제보 | 목록/상세 scaffold | 사용자 제보와 미연결, 상태 저장 없음 |
| 관리자 의식 프리셋 | 목록/상세 scaffold | 저장 동작 없음 |
| 컴포넌트 시스템 | 설계 문서 있음 | 코드 적용은 초기 단계 |
| 테스트 | typecheck/admin build 통과 | Jest 2개 copy mismatch 실패 |

---

## 4. 실행 원칙

1. P0 운영 흐름을 먼저 닫는다.
2. 큰 리팩터링보다 작은 공통 컴포넌트를 먼저 추출한다.
3. Shell은 shell만 담당하고, 페이지 폭은 PageContainer가 담당한다.
4. 사용자 copy와 내부 타입명을 분리한다.
5. 관리자에서 영어 내부 레이블은 허용하되, 사용자에게 노출되는 문구는 한국어 브랜드 언어로 변환한다.
6. 테스트 실패는 기능 실패와 copy 갱신 필요를 구분해서 처리한다.

---

## 5. 작업 순서

### Phase 1. P0 운영 데이터 연결

목표:

- 웹 제보와 관리자 제보가 같은 데이터를 본다.
- 제보 상태 변경이 저장된다.

작업:

- `src/storage/submissions.ts`의 web localStorage 저장을 운영 저장소로 대체하거나 보조 저장으로 낮춘다.
- 관리자 `apps/admin/app/submissions`가 같은 저장소에서 제보를 읽도록 연결한다.
- `new`, `reviewing`, `accepted`, `rejected` 상태 변경 server action을 구현한다.
- 상태 변경 후 목록과 상세 화면이 갱신되도록 한다.

권장 우선안:

- 이미 관리자 auth와 Supabase 기반이 있으므로 Supabase 테이블을 우선 검토한다.
- P0 속도가 더 중요하면 임시 server-side JSON/file store도 가능하지만, 배포 환경에서는 지속성이 약하므로 최종 운영 검증 전 Supabase로 옮긴다.

완료 기준:

- 웹 `/submit`에서 제출한 제보가 관리자 `/submissions`에 보인다.
- 관리자 `/submissions/[id]`에서 상태를 바꾸면 새로고침 후에도 유지된다.
- 제보 상태 라벨은 제보자에게 노출될 경우 `검토 중`, `반영됨`, `반려됨`으로 표시된다.

### Phase 2. 관리자 최소 저장 액션

목표:

- 관리자 화면의 `저장 준비중` 상태를 P0 필수 범위에서 제거한다.

작업:

- 제보 상태 저장을 우선 구현한다.
- 제보에서 콘텐츠 draft 생성 액션을 추가한다.
- 콘텐츠 등록/수정은 P0 필수 필드만 저장한다.
- 의식 프리셋 수정은 P0에서는 read-only 유지 가능 여부를 결정한다.

P0 필수 필드:

- 콘텐츠: 제목, 부제, 카테고리, 콘텐츠 타입, 태그, 공개 상태
- 본문: paragraph 중심의 단순 markdown 또는 block text
- 구조화 정보: 카테고리별 핵심 row
- 제보: 유형, 링크/이미지, 코멘트, 닉네임, 공개 가능 여부, 상태

완료 기준:

- 관리자 핵심 버튼이 실제 저장 동작을 갖는다.
- 실패 시 사용자가 원인을 이해할 수 있는 오류 메시지가 있다.
- 저장 후 목록, 상세, 공개 상태가 일관된다.

### Phase 3. 테스트와 브랜드 언어 동기화

목표:

- 브랜드 언어 전환으로 깨진 테스트를 정상화한다.

작업:

- 실패 중인 테스트의 기대 문구를 `루틴`에서 `의식`으로 갱신한다.
- 사용자 노출 copy에서 `루틴` 잔여 사용을 점검한다.
- 기존 앱 영역은 이번 P0 웹 범위와 분리해 처리하되, 새 웹/아카이브 화면에서는 `의식`을 강제한다.

완료 기준:

- `npm test -- --runInBand` 통과
- `npm run typecheck` 통과
- `npm --prefix apps/admin run build` 통과

### Phase 4. 공통 컴포넌트 1차 추출

목표:

- 카드, 상세, 보관함, 관련 콘텐츠에서 반복되는 UI를 안정화한다.

우선순위:

1. `SaveButton`
2. `Badge`
3. `MetaRow` / `MetaItem`
4. `ArchivePageContainer`
5. `ArchivePageHeader`
6. `ArchiveContentGrid`

원칙:

- `SaveButton`은 인증 상태를 알지 않는다.
- `Badge`는 추천, 업데이트, 카테고리, 타입 라벨에 재사용한다.
- `MetaRow`는 시간, 환경, 욕조 필요 여부, 장소, 가격대를 같은 간격과 폰트로 보여준다.
- `ArchiveContentCard`는 카드 자체만 담당하고, 몇 열에 배치할지는 `ArchiveContentGrid`가 담당한다.

완료 기준:

- 카드 내부 save, badge, meta 표현이 별도 컴포넌트로 분리된다.
- 기존 화면의 동작은 변하지 않는다.
- 컴포넌트 props가 P0 범위 이상으로 과도하게 넓어지지 않는다.

### Phase 5. 최신 시안 레이아웃 적용

목표:

- 최신 explorer/detail 시안의 정보 밀도와 폭 체계를 반영한다.

작업:

- `WebShell`을 `ArchiveShell` 역할로 축소한다.
- 페이지 폭은 `ArchivePageContainer`가 담당한다.
- Explore는 `grid` variant로 1040~1120px 폭을 사용한다.
- Detail은 `detail` variant로 hero, 본문, 구조화 정보 패널 2열을 사용한다.
- Submit/Routines는 `narrow` variant로 720~760px 집중 폭을 유지한다.
- 모바일은 1열과 하단 탭을 유지한다.

완료 기준:

- Desktop Explore: 3열 카드 그리드와 featured horizontal 카드 적용
- Desktop Detail: 큰 hero 이미지와 본문/정보 패널 2열 적용
- Mobile: Hero → Title → ActionBar → StructuredInfoPanel → Body → RelatedContent 순서 유지
- 텍스트와 버튼이 모바일/데스크톱에서 겹치지 않는다.

### Phase 6. 구조화 정보 mapper 정리

목표:

- 내부 enum과 사용자 언어를 분리한다.

작업:

- `StructuredInfoRow` schema를 도입한다.
- 카테고리별 mapper를 별도 함수로 분리한다.
- enum 값은 사용자 한국어로 변환한다.

예시:

```ts
type StructuredInfoRow = {
  label: string;
  value: string;
  icon?: string;
  tone?: 'default' | 'positive' | 'warning' | 'muted';
};
```

변환 예:

```txt
available -> 외부인 이용 가능
restricted -> 조건부 이용
members_only -> 회원 전용
low -> 쉬움
medium -> 보통
high -> 어려움
public -> 공용
semi_private -> 반개별
private -> 프라이빗
```

완료 기준:

- 사용자 화면에 `available`, `low`, `public`, `HOME_BATH` 같은 내부 값이 그대로 나오지 않는다.
- Place, Item, Home Bath, Tips/Culture 모두 같은 패널 컴포넌트로 렌더링된다.

### Phase 7. 프로젝트 작업 규칙 문서 정리

목표:

- 이전 앱 문서를 정리하되, 작업 규칙 문서는 잃지 않는다.

작업:

- 삭제 상태인 `CLAUDE.md`를 복구하거나 최신 웹/P0 기준으로 대체한다.
- 오래된 dark baseline, app-only 규칙은 제거한다.
- Figma MCP, React Native StyleSheet, Expo Web, 관리자 Next 앱 규칙을 최신 기준으로 정리한다.

완료 기준:

- `CLAUDE.md` 또는 동등한 루트 작업 규칙 문서가 존재한다.
- 새 작업자가 P0 웹/관리자 구조를 이해할 수 있다.
- 임시 문서 폴더와 활성 문서의 경계가 명확하다.

---

## 6. 산출물

### Code

- 공통 저장소 기반 submissions flow
- 관리자 제보 상태 변경 action
- 관리자 콘텐츠 draft 생성 action
- 공통 UI 컴포넌트 1차 세트
- 최신 시안 기반 Explore/Detail layout
- 구조화 정보 mapper

### Docs

- 이 계획 문서
- 필요 시 Supabase schema 또는 storage contract 문서
- 최신 `CLAUDE.md` 작업 규칙
- 구현 완료 후 report 또는 changelog entry

### Tests

- 제보 저장/조회 테스트
- 관리자 상태 변경 테스트 또는 server action 단위 검증
- 구조화 정보 mapper 테스트
- 브랜드 copy regression 테스트
- 기존 Jest suite 통과

---

## 7. 리스크와 대응

| 리스크 | 영향 | 대응 |
---|---|---|
| 저장소 선택이 늦어짐 | 관리자 구현이 mock에 머무름 | 제보만 우선 Supabase 또는 임시 서버 저장소로 결정 |
| 컴포넌트 리팩터링이 커짐 | P0 운영 흐름 지연 | Phase 1~3 완료 전 대형 레이아웃 리팩터링 금지 |
| 사용자 copy와 내부 enum 혼재 | 브랜드 품질 저하 | mapper와 labels를 단일 경로로 정리 |
| 기존 앱 테스트와 새 브랜드 copy 충돌 | 테스트 실패 지속 | P0 웹 범위와 기존 앱 범위를 분리해 기대 문구 갱신 |
| `CLAUDE.md` 삭제 지속 | 작업 규칙 손실 | 최신 기준으로 복구 후 이전 규칙만 정리 |

---

## 8. 권장 구현 순서 요약

```txt
1. 제보 저장소 연결
2. 관리자 제보 상태 변경 구현
3. 테스트 문구 갱신
4. SaveButton / Badge / MetaRow 추출
5. ArchivePageContainer 도입
6. Explore / Detail 시안 레이아웃 적용
7. 구조화 정보 mapper 정리
8. CLAUDE.md 최신 기준 복구
```

---

## 9. P0 완료 체크리스트

- [ ] 웹에서 제출한 제보가 관리자에 표시된다.
- [ ] 관리자에서 제보 상태를 저장할 수 있다.
- [ ] 관리자에서 제보를 콘텐츠 draft로 전환할 수 있다.
- [ ] 사용자 화면에 내부 enum/영어 상태값이 노출되지 않는다.
- [ ] Explore가 최신 시안의 grid variant를 사용한다.
- [ ] Detail이 최신 시안의 hero + 2열 detail variant를 사용한다.
- [ ] Submit/Routines는 narrow variant를 유지한다.
- [ ] SaveButton, Badge, MetaRow가 공통 컴포넌트로 분리된다.
- [ ] 사용자 노출 copy에서 `루틴`이 새 웹/아카이브 화면에 남아 있지 않다.
- [ ] `npm run typecheck` 통과
- [ ] `npm --prefix apps/admin run build` 통과
- [ ] `npm test -- --runInBand` 통과
- [ ] 루트 작업 규칙 문서가 최신 기준으로 존재한다.

