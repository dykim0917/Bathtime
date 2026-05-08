# 리추얼 로그 태그 생성 규칙

## 1. 목적

리추얼 로그 MVP에서 기존 루틴 엔진을 추천/실행 흐름으로 재사용하지 않고, 사진 오버레이에 쓸 무드 태그와 감각 태그 후보를 만드는 재료로만 재사용한다.

핵심 원칙:

> 엔진은 사용자가 해야 할 일을 정하지 않는다. 엔진은 사용자가 남기려는 장면에 어울리는 표현 태그 후보만 제안한다.

## 2. 입력 신호

기존 `BathRecommendation`에서 태그 생성에 쓸 수 있는 필드는 다음이다.

```ts
interface BathRecommendation {
  intentId?: string;
  themeId?: string;
  themeTitle?: string;
  persona: PersonaCode;
  environmentUsed: BathEnvironment;
  ingredients: Ingredient[];
  ambience: AmbienceTrack;
  lighting: string;
  durationMinutes: number | null;
}
```

P0에서는 `temperature`, `safetyWarnings`, `behaviorBlocks`를 태그 생성에 쓰지 않는다. 건강/처방 느낌이 강해질 수 있기 때문이다.

## 3. 출력 구조

```ts
export type RitualLogMoodTagId =
  | 'quiet_night'
  | 'light_reset'
  | 'deep_rest'
  | 'hotel_spa'
  | 'rainy_night'
  | 'forest_bath'
  | 'warm_recovery'
  | 'soft_sleep';

export type RitualLogFeelingTagId =
  | 'woody'
  | 'herbal'
  | 'citrus'
  | 'floral'
  | 'unscented'
  | 'moist'
  | 'fresh'
  | 'cooling'
  | 'gentle'
  | 'bath_additive'
  | 'body_wash'
  | 'body_oil'
  | 'candle'
  | 'tray';

export interface RitualLogTagSuggestion {
  moodTags: RitualLogMoodTagId[];
  feelingTags: RitualLogFeelingTagId[];
}
```

## 4. 무드 태그 생성 규칙

무드 태그는 `intentId`, `themeId`, `ambience.id`, `persona` 순서로 만든다.

### intentId 기반

| intentId | moodTags |
| --- | --- |
| `sleep_ready` | `quiet_night`, `soft_sleep` |
| `stress_relief` | `quiet_night`, `deep_rest` |
| `mood_lift` | `light_reset` |
| `muscle_relief` | `warm_recovery`, `deep_rest` |
| `edema_relief` | `warm_recovery` |
| `cold_relief` | `warm_recovery` |
| `menstrual_relief` | `warm_recovery`, `deep_rest` |
| `hangover_relief` | `light_reset` |

### themeId 기반

| themeId | moodTags |
| --- | --- |
| `kyoto_forest` | `forest_bath`, `deep_rest` |
| `rainy_camping` | `rainy_night`, `quiet_night` |
| `nordic_sauna` | `hotel_spa`, `light_reset` |
| `snow_cabin` | `soft_sleep`, `quiet_night` |
| `ocean_dawn` | `light_reset` |
| `tea_house` | `quiet_night`, `deep_rest` |

### ambience 기반

| ambience.id | moodTags |
| --- | --- |
| `rain` | `rainy_night`, `quiet_night` |
| `forest` | `forest_bath`, `deep_rest` |
| `ocean` | `light_reset` |
| `hotspring` | `hotel_spa`, `warm_recovery` |
| `fireplace` | `soft_sleep`, `quiet_night` |

### persona fallback

| persona | moodTags |
| --- | --- |
| `P1_SAFETY` | `quiet_night` |
| `P2_CIRCULATION` | `warm_recovery` |
| `P3_MUSCLE` | `deep_rest`, `warm_recovery` |
| `P4_SLEEP` | `quiet_night`, `soft_sleep` |

## 5. 감각 태그 생성 규칙

감각 태그는 `ingredients`, `themeTitle/themeId`, `ambience.id`, `environmentUsed`에서 만든다.

### ingredient 기반

| ingredient.id | feelingTags |
| --- | --- |
| `lavender_oil` | `herbal`, `gentle` |
| `marjoram_oil` | `herbal`, `gentle` |
| `carbonated_bath` | `bath_additive`, `fresh` |
| `grapefruit_oil` | `citrus`, `fresh` |
| `epsom_salt` | `bath_additive`, `gentle` |
| `peppermint_oil` | `herbal`, `cooling` |
| `hinoki_oil` | `woody`, `herbal` |
| `rosemary_oil` | `herbal`, `fresh` |
| `clary_sage_oil` | `herbal`, `gentle` |
| `eucalyptus_oil` | `herbal`, `fresh` |
| `chamomile_oil` | `herbal`, `gentle` |
| `shower_steamer` | `herbal`, `fresh` |
| `body_wash_relaxing` | `body_wash`, `moist`, `gentle` |

### theme 기반

| themeId | feelingTags |
| --- | --- |
| `kyoto_forest` | `woody`, `herbal` |
| `rainy_camping` | `woody`, `candle` |
| `nordic_sauna` | `woody`, `fresh` |
| `snow_cabin` | `unscented`, `gentle` |
| `ocean_dawn` | `fresh` |
| `tea_house` | `herbal`, `gentle` |

### environment 기반 fallback

| environmentUsed | feelingTags |
| --- | --- |
| `shower` | `body_wash`, `fresh` |
| `partial_bath` / `footbath` | `gentle` |
| `bathtub` | `bath_additive` |

## 6. 선택/정렬 원칙

자동 추천 후보는 최대 5개까지 만들되, UI에서는 사용자가 최대 3개만 선택하게 한다.

우선순위:

1. 사용자가 직접 선택한 태그
2. 사진 로그 화면에서 최근 사용한 태그
3. `ingredients` 기반 감각 태그
4. `themeId` / `ambience` 기반 태그
5. `environmentUsed` fallback

중복은 제거한다. 같은 계열이 너무 많으면 더 구체적인 태그를 남긴다.

예:

- `herbal`, `gentle`, `body_wash`, `moist`가 나오면 UI 기본 후보는 `body_wash`, `moist`, `herbal` 우선
- `quiet_night`, `soft_sleep`, `rainy_night`가 나오면 `rainy_night`, `quiet_night` 우선

## 7. 문구 생성과의 연결

태그는 오버레이 문구 생성에도 쓴다.

예:

```txt
moodTags: rainy_night, quiet_night
feelingTags: woody, candle
environment: bathtub
```

생성 문구:

> 비 오는 밤처럼 차분하게, 우디한 향과 낮은 불빛만 남긴 욕조 시간.

```txt
moodTags: light_reset
feelingTags: citrus, body_wash
environment: shower
```

생성 문구:

> 시트러스 향이 짧게 스치고, 샤워 뒤의 공기만 산뜻하게 남긴 시간.

## 8. 금지 규칙

태그 생성 결과에 아래 항목은 포함하지 않는다.

- 질환명
- 치료/완화/효능 표현
- 실제 브랜드명
- 실제 상품명
- 가격/구매처
- 타이머 실행을 유도하는 문장
- “해야 한다” 형태의 지시문

## 9. 구현 위치

추천 구현 파일:

```txt
src/ritualLog/ritualLogTags.ts
src/ritualLog/__tests__/ritualLogTags.test.ts
```

`src/engine/recommend.ts`는 수정하지 않는다. 기존 엔진은 그대로 두고, 리추얼 로그 쪽에서 `BathRecommendation`을 읽어 태그 후보만 추출한다.

이렇게 해야 기존 앱의 추천/타이머 구조가 리추얼 로그 MVP를 다시 끌고 가지 않는다.
