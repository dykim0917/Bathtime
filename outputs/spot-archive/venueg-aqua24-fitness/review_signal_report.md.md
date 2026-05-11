# {spot_name} Review Signal Report

리서치 일자: {YYYY-MM-DD}
후기 조사 상태: deep | medium | shallow | unavailable

## Review Source Coverage

| 소스 바스켓 | 확인 여부 | 사용한 출처 수 | 최신 후기 시점 | 메모 |
|---|---:|---:|---|---|
| 네이버플레이스 리뷰 | 확인/미확인 |  |  |  |
| 카카오맵 리뷰 | 확인/미확인 |  |  |  |
| 구글맵 리뷰 | 확인/미확인 |  |  |  |
| 네이버 블로그 | 확인/미확인 |  |  |  |
| 네이버 카페/커뮤니티 | 확인/미확인 |  |  |  |
| 기타 블로그/Tistory | 확인/미확인 |  |  |  |
| SNS/YouTube | 확인/미확인 |  |  |  |
| 예약/여행 플랫폼 | 확인/미확인 |  |  |  |

## Repeated Positive Signals

| 신호 | 반복 정도 | 출처 유형 | 신뢰도 | 콘텐츠 반영 방식 |
|---|---:|---|---|---|
| 예: 리뉴얼 후 시설이 깔끔하다는 언급 | 3+ | 블로그/지도 리뷰 | medium | "쾌적해졌다는 후기 신호" |
| 예: 키즈존 만족도 | 2+ | 후기/블로그 | medium | 가족 방문 적합성 보조 근거 |

## Repeated Negative Signals

| 신호 | 반복 정도 | 출처 유형 | 신뢰도 | 콘텐츠 반영 방식 |
|---|---:|---|---|---|
| 예: 주말 주차 혼잡 | 3+ | 지도 리뷰/블로그 | medium | 방문 전 체크 항목 |
| 예: 공용공간 소음 | 2+ | 후기 | low/medium | 조용한 1인 휴식에는 애매함 |

## Conflicting Review Signals

| 항목 | 긍정 신호 | 부정 신호 | 처리 |
|---|---|---|---|
| 청결 | 리뉴얼 후 깨끗하다는 후기 | 일부 구역 노후/혼잡 언급 | "구역별 차이 가능성"으로 정리 |
| 주차 | 무료 주차 언급 | 주말 혼잡/시간 충돌 | 전화 확인 필요 |

## Experience Signal Matrix

| 항목 | 판단 | 근거 유형 | 신뢰도 |
|---|---|---|---|
| 청결 | good / mixed / weak / unknown | repeated_review_signal | medium |
| 혼잡 | low / medium / high / mixed / unknown | repeated_review_signal | medium |
| 조용함 | high / medium / low / mixed / unknown | inference + reviews | low |
| 혼자 이용 | high / medium / low / unknown | inference + reviews | medium |
| 가족 이용 | high / medium / low / unknown | repeated_review_signal | medium |
| 커플/친구 이용 | high / medium / low / unknown | inference + reviews | medium |
| 주차 | easy / mixed / difficult / unknown | conflicting_review_signal | medium |
| 음식/매점 | good / mixed / weak / unknown | review_signal | low |
| 시설 노후도 | new / maintained / old / mixed / unknown | review_signal | medium |

## Editorial Takeaway

{후기 신호를 배스타임 관점으로 요약}

## Review Coverage Gaps

- [ ] 구글맵 리뷰 확인 필요
- [ ] 네이버플레이스 최신 리뷰 확인 필요
- [ ] 카카오맵 리뷰 확인 필요
- [ ] 리뉴얼 이후 후기만 별도 확인 필요
- [ ] 커뮤니티 후기 확인 필요