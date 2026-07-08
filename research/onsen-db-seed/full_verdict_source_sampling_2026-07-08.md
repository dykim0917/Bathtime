# Full Verdict Source Sampling (2026-07-08)

목적: 현재 원천데이터 중 `full` verdict 작성 기준을 만들기에 가장 좋은 숙소를 선별한다. 이 문서는 DB 적재 파일이 아니라, full verdict 변환 모델의 기준 샘플 목록이다.

## 선별 기준

- 직접 읽은 리뷰가 300건 이상이다.
- 온천 관련 직접 리뷰가 200건 이상이다.
- 직접 본문 플랫폼이 3개 이상이다.
- `visible_review_count`와 `direct_read_review_count`가 분리되어 있다.
- 객실탕, 객실 노천탕, 대절탕, 가족탕, 대욕장, 수질, 운영 주의 신호 중 최소 2개 이상이 분리 태깅되어 있다.
- 부정/혼합 신호가 숨겨지지 않고, full verdict의 주의 문장으로 전환 가능하다.

## Full Verdict 채택 기준 v0.1

이 문서의 `직접 300+ / 온천 200+ / 플랫폼 3+`는 샘플 선별 기준이면서, 현재 `full` 승격의 최소 표본 기준이다. 개발 문서와 카피 가이드도 같은 기준을 따른다.

다만 표본 기준을 넘었다고 모든 태그가 판정 근거가 되는 것은 아니다. full verdict의 `items[]`로 올릴 항목은 아래 조건을 모두 통과해야 한다.

- 언급 수가 10건 이상이다.
- 언급 수가 해당 분모의 2% 이상이다.
- 2개 이상 플랫폼에서 확인된다.
- `positive / mixed / negative / neutral` 방향 카운트가 분리되어 있다.
- `mentions`는 `positive + mixed + negative`로 계산하고, 단순 시설 언급인 `neutral`은 제외한다.

미달 항목 처리:

- 5건 이상이고 2플랫폼 이상이면 `확인해둘 점`의 보조 주의 문장으로만 쓸 수 있다.
- 1~4건이거나 단일 플랫폼이면 사용자 노출에서 제외하고 내부 QA 메모로만 남긴다.
- 공식 사실이 따로 확인되는 경우에도, 후기 기반 판정처럼 쓰지 않고 예약 전 확인 문장으로만 처리한다.

따라서 하치요의 `유량 주의 4건 / 1플랫폼`은 full verdict 독립 근거가 아니라 내부 참고다. 반대로 `온도 차가움 14건 / 2플랫폼`은 분모 조건을 통과하면 조건부 판정 항목 후보가 될 수 있다.

## 1차 추천 샘플

| 우선순위 | slug | 한국어명 | 샘플 역할 | 직접 읽은 리뷰 | 온천 관련 리뷰 | 직접 플랫폼 | 판정 |
|---:|---|---|---|---:|---:|---:|---|
| 1 | `beppu-hachiyo` | 하치요 | 가장 먼저 full verdict로 변환할 기준 샘플 | 498 | 487 | 4 | 강력 추천 |
| 2 | `beppu-marugamiya` | 마루가미야 | 대절탕/가족탕 중심 숙소 기준 샘플 | 568 | 529 | 3 | 강력 추천 |
| 3 | `yufuin-konjakuan` | 벳소 콘자쿠안 / 별장 금석암 | 객실탕+가족탕+운영주의 복합 샘플 | 867 | 812 | 5 | 강력 추천 |
| 4 | `unzen-fukudaya` | 운젠 후쿠다야 | 백탁/유황/객실 노천+공용 노천 복합 샘플 | 530 | 435 | 8 | 추천 |
| 5 | `ibusuki-hakusuikan` | 이부스키 하쿠스이칸 | 대형 리조트/대욕장/모래찜질 대량 표본 샘플 | 2451 | 1799 | 8 | 추천, 후순위 |
| 6 | `ureshino-taishoya` | 우레시노 온천 다이쇼야 | 수질/피부감 중심 판정 샘플 | 369 | 328 | 4 | 추천 |
| 7 | `kurokawa-okunoyu` | 료칸 오쿠노유 | 구로카와 노천/대절탕/객실탕 혼합 샘플 | 347 | 269 | 8 | 추천 |
| 8 | `yufuin-den-rikyu` | 오야도 덴 리큐 | 최소 A급 경계선, 객실 프라이빗 온천형 샘플 | 301 | 220 | 7 | 보조 추천 |

## 왜 1-3번부터인가

### 1. `beppu-hachiyo`

`review_signal_summary_2026-07-08.md`에 full verdict 변환에 필요한 카운트가 이미 가장 깔끔하게 정리되어 있다.

- 객실 노천탕: 127건 / 3플랫폼
- 대절탕: 124건 / 4플랫폼
- 객실탕: 63건 / 2플랫폼
- 가족탕: 29건 / 3플랫폼
- 온도 차가움: 14건 / 2플랫폼
- 유량 주의: 4건 / 1플랫폼

판정 문장으로 바꾸면 “전 객실/전 구역 온천” 같은 과장 없이, `객실 노천탕과 무료 대절탕을 중심으로 선택할 숙소`라고 말할 수 있다. 부정 신호도 작지만 명확해 주의 문장 기준을 만들기 좋다.

단, `유량 주의 4건 / 1플랫폼`은 v0.1 기준상 `items[]`에 올리지 않는다. 이 항목은 공식 운영 사실과 함께 예약 전 확인 문장으로만 쓸 수 있다.

주요 파일:

- `research/onsen-review-signals/beppu-hachiyo/review_signal_summary_2026-07-08.md`
- `research/onsen-review-signals/beppu-hachiyo/direct_review_sample_index_2026-07-08.csv`
- `research/onsen-review-signals/beppu-hachiyo/collection_stats_2026-07-08.json`

### 2. `beppu-marugamiya`

객실탕형이 아니라 `대절탕/가족탕/스나유/무시유` 중심이라는 점이 데이터에서 뚜렷하다. 숙소의 실제 선택 이유를 잘못 분류하지 않는 모델을 만들기에 좋다.

- 대절탕 경험 태그: 355건
- 가족탕 태그: 156건
- 스나유/무시유 등 시설 체험: 요약 기준 169건
- 대욕장 없음/대욕장형 아님 맥락: 46건
- 온도 관리 주의: 12건

full verdict에서 “객실탕 숙소가 아니라, 여러 대절탕을 골라 쓰는 숙소입니다”처럼 Bathtime다운 판정을 만들 수 있는 샘플이다.

주요 파일:

- `research/onsen-review-signals/beppu-marugamiya/review_signal_summary_2026-07-08.md`
- `research/onsen-review-signals/beppu-marugamiya/direct_review_sample_index_2026-07-08.csv`
- `research/onsen-review-signals/beppu-marugamiya/collection_stats_2026-07-08.json`

### 3. `yufuin-konjakuan`

표본 규모와 태그 밀도가 모두 좋다. 객실 내탕, 객실 노천탕, 가족탕, 온천감 약함, 예약 혼동이 함께 잡혀 있어 “긍정만 있는 숙소 소개”가 아니라 이용 판단형 verdict 기준을 만들기 좋다.

태그 카운트는 중복 가능 기준이다.

- 객실 내탕 태그: 657건
- 객실 노천탕 태그: 327건
- 가족탕 태그: 262건
- 객실탕 온천 경험 태그: 330건
- 대절/프라이빗탕 경험 태그: 263건
- 온천감 약함 태그: 123건
- 예약/운영 혼동 태그: 74건

full verdict에서는 “객실탕 만족이 강하지만, 가족탕/객실탕/운영 조건을 예약 전에 분리 확인해야 하는 숙소”로 정리할 수 있다.

주요 파일:

- `research/onsen-review-signals/yufuin-konjakuan/review_signal_summary_2026-07-08.json`
- `research/onsen-review-signals/yufuin-konjakuan/direct_review_sample_index_2026-07-08.csv`
- `research/onsen-review-signals/yufuin-konjakuan/collection_stats_2026-07-08.json`

## 후순위지만 중요한 샘플

### `ibusuki-hakusuikan`

직접 읽은 2451건, 온천 관련 1799건으로 현재 규슈 원천데이터 중 규모가 가장 크다. 다만 대형 리조트형이라 대욕장, 노천, 모래찜질, 일부 객실탕, 예약/혼잡 신호가 넓게 섞인다. 첫 full verdict 기준을 만들기보다는, 1-3번으로 모델을 정리한 뒤 대형 복합시설 스트레스 테스트로 쓰는 편이 좋다.

### `unzen-fukudaya`

백탁/유황/원천가케나가시 인상이 뚜렷하고, 객실 노천탕·공용 노천탕·대절탕이 모두 잡힌다. 직접 플랫폼이 8개라 근거 분산이 좋다. 수질과 욕장별 경험을 함께 판정하는 샘플로 적합하다.

### `ureshino-taishoya`

수질/피부감 계열 태그가 매우 강하다. 우레시노 특유의 `미인탕` 기대를 Bathtime 언어로 바꾸는 기준 샘플이다. 다만 자매관 온천 이용과 숙소 자체 욕장을 분리해야 하므로 초반 기준 샘플보다는 수질형 보조 샘플로 둔다.

### `kurokawa-okunoyu`

구로카와의 노천탕·대절탕·객실탕 신호가 넓게 걸린다. 직접 플랫폼 수는 좋지만 표본 수가 347건으로 여유가 크지는 않다. 구로카와권 판정 언어를 만들 때 우선 검토할 수 있다.

### `yufuin-den-rikyu`

직접 읽은 리뷰가 301건으로 A급 최소선에 가깝다. 대신 플랫폼 수가 7개이고 객실 프라이빗 온천형 신호가 선명하다. “300건 턱걸이지만 full verdict로 올릴 수 있는가”를 검증하는 경계 샘플로 좋다.

## 주의해서 봐야 할 샘플

### `yufuin-musouen`

현재 보강 후 직접 읽은 1391건, 온천 관련 1362건으로 A급이다. 다만 과거 파일에서 숙박 리뷰와 당일입욕/온천시설 리뷰가 섞였던 이력이 있다. 숙소 DB full verdict로 쓰려면 `숙박자 리뷰`와 `시설/당일입욕 리뷰` 분리 검산을 한 번 더 거친 뒤 사용하는 것이 안전하다.

### `unzen-kyushu-hotel`

직접 읽은 1531건으로 양은 충분하다. 하지만 `water_texture`가 815건으로 매우 넓게 잡혀 있고, 부정/혼합 방향도 많이 나온다. 실제 부정 신호인지, 태깅 기준이 넓어서 생긴 분포인지 먼저 재검산해야 한다. full verdict 모델의 초기 기준 샘플보다는 태깅 품질 QA 샘플에 가깝다.

## 제안하는 작업 순서

1. `beppu-hachiyo`로 full verdict 1호를 작성한다.
2. 같은 스키마로 `beppu-marugamiya`를 작성해 객실탕형이 아닌 숙소 표현을 검증한다.
3. `yufuin-konjakuan`을 작성해 복합 bath-area와 예약/운영 주의 문장 기준을 검증한다.
4. 세 개의 결과를 비교해 `verdict.items[]`의 필수 필드와 문장 톤을 고정한다.
5. 이후 `ibusuki-hakusuikan`, `unzen-fukudaya`, `ureshino-taishoya`로 대형 리조트형·수질형·유황형 판정을 확장한다.
