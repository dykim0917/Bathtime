# 리추얼 로그 MVP 구현 스펙 초안

## 1. 목표

추천형 리추얼 카드 엔진이 아니라 사진 기반 리추얼 로그 생성기를 구현한다.

P0의 성공 조건은 사용자가 사진을 선택하고, 바스타임 오버레이를 적용한 이미지를 저장/공유할 수 있는 것이다.

## 2. 신규 라우트

```txt
/ritual-log
```

역할:

- 사진 선택
- 메타 선택
- 오버레이 미리보기
- 저장/공유

기존 `/result/timer`, `/result/completion`, `BathRecommendation` 플로우와 연결하지 않는다.

## 3. 신규 타입

```ts
export type RitualLogEnvironment = 'shower' | 'footbath' | 'bathtub' | 'home_spa';
export type RitualLogTemplate = 'minimal' | 'spa' | 'magazine' | 'soft';

export interface RitualLogDraft {
  photoUri: string;
  moodId: string;
  environment: RitualLogEnvironment;
  productTags: string[];
  templateStyle: RitualLogTemplate;
}

export interface RitualLogOverlay {
  id: string;
  photoUri: string;
  title: string;
  moodLabel: string;
  environmentLabel: string;
  productTags: string[];
  ritualLine: string;
  guideLine?: string;
  timeLabel?: string;
  templateStyle: RitualLogTemplate;
  hashtags: string[];
  createdAt: string;
}
```

## 4. 신규 모듈 후보

```txt
src/ritualLog/ritualLogTypes.ts
src/ritualLog/ritualLogTags.ts
src/ritualLog/ritualLogCopy.ts
src/ritualLog/ritualLogBuilder.ts
src/storage/ritualLog.ts
app/ritual-log/index.tsx
```

`ritualLogTags.ts`는 기존 `BathRecommendation`을 직접 실행하지 않는다. 이미 있는 추천 결과나 선택 문맥에서 `intentId`, `themeId`, `ingredients`, `ambience`, `environmentUsed`만 읽어 무드/감각 태그 후보로 변환한다.

## 5. 저장 구조

AsyncStorage에 최근 리추얼 로그를 보관한다.

저장할 것:

- overlay metadata
- photoUri
- createdAt

P0에서는 이미지 파일 자체의 별도 업로드/동기화는 하지 않는다.

## 6. 구현 순서

1. 타입과 copy builder 작성
2. 엔진 신호 기반 태그 후보 생성 규칙 작성
3. 저장소 작성 및 테스트
4. `/ritual-log` 화면 추가
5. 이미지 선택 기능 연결
6. 오버레이 미리보기 작성
7. 템플릿 전환 구현
8. 저장/공유 API 연결
9. 홈 진입 CTA 연결
10. 웹/모바일 QA

## 7. 테스트 케이스

### copy builder

- 무드, 환경, 태그 조합으로 `ritualLine`을 만든다.
- 태그가 없어도 fallback 문구를 만든다.
- 해시태그는 중복 없이 생성한다.

### tag builder

- `intentId`로 무드 태그 후보를 만든다.
- `ingredients`로 감각 태그 후보를 만든다.
- `ambience.id`와 `themeId`로 장면형 무드 태그를 보강한다.
- 중복 태그를 제거하고 최대 후보 개수를 제한한다.
- 건강/질환/효능 표현은 태그로 노출하지 않는다.

### storage

- 로그를 저장하고 최신순으로 불러온다.
- 같은 id 저장 시 덮어쓴다.
- 저장 목록을 최대 개수로 제한한다.

### UI

- 사진 없이는 저장 버튼이 비활성화된다.
- 태그는 최대 3개까지만 선택된다.
- 템플릿을 바꾸면 미리보기가 바뀐다.

## 8. P0 제외

- AI 이미지 생성
- 자동 제품 인식
- 제품 DB
- 커뮤니티 피드
- 타이머
- 사운드
- 완료 피드백
- 건강 상태 기반 추천
