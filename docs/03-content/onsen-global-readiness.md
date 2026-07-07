# 온천 검색기 글로벌 확장 준비 메모

바스타임 온천 검색기는 지금 한국어 서비스로 검증합니다. 다만 판정 모델의 핵심 데이터는 언어 중립으로 유지합니다. 나중에 영어권 파일럿을 붙일 때 기존 판정 구조를 다시 만들지 않기 위해 아래 원칙을 지킵니다.

## 1. 지금 하지 않는 것

- 영어 페이지를 바로 발행하지 않습니다.
- 한국어 `직수 온천` 같은 조어를 그대로 번역하지 않습니다.
- 글로벌 사용자의 질문을 한국 사용자 질문의 번역판으로 가정하지 않습니다.
- 외부 이용 경험 원문이나 의역을 영어 콘텐츠로 재게시하지 않습니다.

## 2. 지금 해두는 것

### 판정 데이터는 언어 중립으로 둔다

다음 값은 번역 대상이 아니라 공통 기준입니다.

- `water_source_type`
- `bath_scope`
- `briefing.experiences_read`
- `briefing.onsen_related`
- `items[].counts`
- `fact_statuses`

문장은 시장별로 달라질 수 있지만, 카운트와 구조화 팩트는 하나만 유지합니다.

### 문장 레이어는 locale별 오버레이로 둔다

`onsen_verdicts.localized_copy`는 나중에 언어별 판정문을 얹기 위한 선택 필드입니다. 기존 한국어 렌더링은 `headline`, `items`를 계속 canonical copy로 사용합니다.

권장 구조:

```json
{
  "ko": {
    "headline": "객실 안에서 온천이 완결되는 숙소입니다.",
    "items": [
      {
        "order": 1,
        "headline": "객실 노천탕 만족은 논쟁이 없는 항목입니다.",
        "body": "온천 관련 234건 중 객실 노천탕 언급 86건, 부정 판정 3건.",
        "verdict": "대욕장 없이 객실탕만으로 충분한지 고민하지 않으셔도 됩니다."
      }
    ]
  },
  "en": {
    "headline": "A ryokan where the onsen experience is completed in your room.",
    "items": []
  }
}
```

`localized_copy`에는 원문 이용 경험을 넣지 않습니다. 바스타임이 판정한 문장만 넣습니다.

### 글로벌 여행자 팩트는 별도 JSON으로 둔다

`onsen_accommodations.global_travel_facts`는 한국어 MVP에는 당장 노출하지 않더라도 영어권 파일럿에서 필요한 축을 담기 위한 필드입니다.

권장 키:

- `tattoo_policy`: 타투 이용 가능 여부
- `gender_policy`: 남녀 구분, 혼욕, 전용탕 구조
- `english_support`: 영어 안내와 응대 가능성
- `couple_private_bath`: 커플 또는 동반자가 함께 쓸 수 있는 프라이빗탕 조건

권장 값 구조:

```json
{
  "tattoo_policy": {
    "status": "check_at_booking",
    "label_ko": "타투 이용 조건 확인",
    "label_en": "Check tattoo policy before booking",
    "source": "official_or_manual",
    "updated_at": "2026-07-07"
  }
}
```

상태값은 다음 중 하나를 기본으로 씁니다.

- `confirmed_yes`
- `confirmed_no`
- `conditional`
- `check_at_booking`
- `unknown`

## 3. 시장별 용어 가이드는 따로 만든다

한국어의 `직수 온천`은 정수기 시장의 `직수형`에서 빌린 조어입니다. 영어권에서 그대로 작동한다고 보지 않습니다.

영어권 파일럿 전에는 별도 `en` 용어 가이드를 작성합니다. 후보는 아래처럼 검토하되, 실제 검색어와 사용자 이해도를 확인하기 전까지 확정하지 않습니다.

| Canonical code | 한국어 | 영어 후보 |
| --- | --- | --- |
| `free_flowing_source` | 직수 온천 | kakenagashi / free-flowing onsen |
| `recirculated` | 재사용 온천(순환식) | recirculated onsen |
| `room_bath` | 객실 내 프라이빗탕 | in-room private onsen |
| `private_bath` | 대절탕 | private reservable bath |

## 4. 영어 파일럿 조건

한국어에서 판정 모델과 데이터 품질이 안정된 뒤, 아래 3곳 정도로만 영어 SEO 테스트를 합니다.

- 하코네 백단
- 도야호 더 레이크 스위트 고노스미카
- 벳푸 칸나와엔

파일럿의 목적은 글로벌 출시가 아니라 검색 수요 확인입니다. 예를 들어 `kakenagashi ryokan hakone`, `tattoo friendly onsen`, `private onsen ryokan` 같은 롱테일 유입이 잡히는지 봅니다.

## 5. 체크리스트

- [ ] 새 판정 데이터는 카운트와 팩트를 언어 중립 필드에 먼저 넣었는가?
- [ ] 문장 번역은 `localized_copy` 같은 locale별 오버레이에만 넣었는가?
- [ ] 글로벌 여행자 팩트는 원문 인용 없이 상태와 출처 메타로만 저장했는가?
- [ ] 한국어 조어를 영어로 직역하지 않았는가?
- [ ] 영어 페이지 발행 전 시장별 용어 가이드를 별도로 작성했는가?

마지막 업데이트: 2026년 7월
